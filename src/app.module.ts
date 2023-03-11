import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SoModule } from './so/so.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    RedisModule,
    AuthModule,
    UserModule,
    SoModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
