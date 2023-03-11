import { ExecutionContext, Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { NewSoDto } from './dto';
import { WsJwtGuard } from '../auth/guard/wsjwt.guard';
import { SoService } from './so.service';
import { JwtService } from '@nestjs/jwt';

// getting port from .env
// useful while testing
const WSPORT = parseInt(new ConfigService().get('WSPORT'));

@WebSocketGateway(WSPORT, {
  cors: {
    origin: '*',
  },
  connectTimeout: '5000',
  namespace: 'so',
})
export class SoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger;
  constructor(private soService: SoService, private jwt: JwtService) {
    this.logger = new Logger(SoGateway.name);
  }

  @WebSocketServer() io: Namespace;

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('addSo')
  async handleMessage(client: Socket, payload: NewSoDto): Promise<void> {
    this.logger.log(`\nClient: ${client.id}\nPayload: ${payload.content}\n`);
    // addSo()
    // extract userId from JWT payload
    // hackxy solution, needs better implementation
    const jwtToken: string = client.request.headers['token'].toString();
    // this.logger.log(jwtToken);

    const jwtData = this.jwt.decode(jwtToken);
    // this.logger.log(jwtData);

    const userId = parseInt(jwtData['sub']);
    this.logger.log(userId);

    this.soService.addSo(userId, payload);

    // emit so to all listening clients
    this.io.emit('so', payload);
  }

  async publishSo(payload: NewSoDto) {
    this.logger.log(`🆕 so published‼️`);
    // emit so to all listening clients
    this.io.emit('so', payload);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Namespace) {
    this.logger.log(`🔴 Gateway Initialized! (PORT=${WSPORT})`);
  }
  async handleConnection(client: Socket) {
    this.logger.log(`✅ : ${client.id}`);
    this.logger.log(`🥷 : ${this.io.sockets.size}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`❌ : ${client.id}`);
    this.logger.log(`🥷 : ${this.io.sockets.size}`);
  }
}
