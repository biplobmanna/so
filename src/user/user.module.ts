import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisService } from '../redis/redis.service';
import { CacheMiddleware } from '../redis/cache.middleware';

@Module({
  controllers: [UserController],
  providers: [UserService, RedisService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CacheMiddleware).forRoutes({
      path: '/users',
      method: RequestMethod.GET,
    });
  }
}
