import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheMiddleware } from './cache.middleware';

// @Global()
@Module({
  imports: [
    // workaround for redis ^4.0.0
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // inconsistency with cache-manager-redis-store ^3.0.0
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: config.get('REDIS_HOST'),
            port: +config.get('REDIS_PORT'),
          },
        });
        return {
          store: store as unknown as CacheStore, // hacky, but no other option
          ttl: 5 * 60 * 60, // 5h
        };
      },
      isGlobal: true,
    }),
  ],
  providers: [RedisService, CacheMiddleware],
})
export class RedisModule {}
