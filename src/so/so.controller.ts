import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { SoService } from './so.service';
import { EditSoDto, NewSoDto } from './dto';

@Controller()
export class SoController {
	constructor(private soService: SoService) {}

	@Get('/so/tag/:tag')
	getSoByTag(@Param('tag') tag: string) {
		return this.soService.getSoByTag(tag);
	}

	@Get('/so/users/:username')
	getSoByUser(@Param('username') username: string) {
		return this.soService.getSoByUser(username);
	}

	@Get('/so/:sid')
	getSoById(@Param('sid', ParseIntPipe) sid: number) {
		return this.soService.getSoById(sid);
	}

	@UseGuards(JwtGuard)
	@Patch('/so/:sid')
	updateSoById(
		@GetUser('id') userId: number,
		@Param('sid', ParseIntPipe) soId: number,
		@Body() soDto: EditSoDto,
	) {
		return this.soService.updateSoById(userId, soId, soDto);
	}

	@UseGuards(JwtGuard)
	@Delete('/so/:sid')
	deleteSoById(
		@GetUser('id') userId: number,
		@Param('sid', ParseIntPipe) soId: number,
	) {
		return this.soService.deleteSoById(userId, soId);
	}

	@UseGuards(JwtGuard)
	@Post('/so')
	addSo(@GetUser('id') userId: number, @Body() soDto: NewSoDto) {
		return this.soService.addSo(userId, soDto);
	}

	@Get('/so')
	getSo() {
		return this.soService.getSo();
	}

	@Get()
	get() {
		return this.soService.getSo();
	}
}
