import { Module } from '@nestjs/common';
import { SoController } from './so.controller';
import { SoService } from './so.service';

@Module({
	controllers: [SoController],
	providers: [SoService],
})
export class SoModule {}
