import { Module } from '@nestjs/common';
import { SoController } from './so.controller';
import { SoService } from './so.service';
import { SoGateway } from './so.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SoController],
  providers: [SoService, SoGateway],
})
export class SoModule {}
