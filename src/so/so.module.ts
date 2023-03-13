import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SoController } from './so.controller';
import { SoService } from './so.service';
import { SoGateway } from './so.gateway';
import { JwtModule } from '@nestjs/jwt';
import { CacheMiddleware } from '../redis/cache.middleware';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SoController],
  providers: [SoService, SoGateway, RedisService],
})
export class SoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CacheMiddleware).forRoutes({
      path: '/*',
      method: RequestMethod.GET,
    });
  }
}
