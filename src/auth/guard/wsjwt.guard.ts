import { ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export class WsJwtGuard extends AuthGuard('wsjwt') {
  private readonly logger;
  constructor() {
    super();
    this.logger = new Logger(WsJwtGuard.name);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // this.logger.log(`context: ${context.getClass().name}`);
    let client: Socket;
    try {
      client = context.switchToWs().getClient<Socket>();
      const result = (await super.canActivate(context)) as boolean;
      // this.logger.log(`AuthGuard('wsjwt') Activate: ${result}`);
      return result;
    } catch (error) {
      this.logger.log(`⛔ Unauthorized Client (id: ${client.id})`);
      client.disconnect(); // disconnect unauthorized client
      throw new WsException(`Unauthorized Exception!`);
    }
  }
  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}
