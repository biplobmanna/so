import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtDto } from '../dto';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
  private readonly logger;
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      secretOrKey: config.get('JWT_SECRET'),
    });
    this.logger = new Logger(WsJwtStrategy.name);
    this.logger.log(`here`);
  }

  async validate(payload: JwtDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });
      return user;
    } catch (error) {
      throw new WsException('⛔ Unauthorized Access!');
    }
  }
}
