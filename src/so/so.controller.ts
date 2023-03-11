import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { SoService } from './so.service';
import { EditSoDto, NewSoDto } from './dto';
import { SoInterceptor } from './so.interceptor';

@Controller()
export class SoController {
  constructor(private soService: SoService) {}

  @CacheKey('sotag')
  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so/tag/:tag')
  getSoByTag(@Param('tag') tag: string) {
    return this.soService.getSoByTag(tag);
  }

  @CacheKey('sousers')
  @CacheTTL(10 * 60) // 10 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so/users/:username')
  getSoByUser(@Param('username') username: string) {
    return this.soService.getSoByUser(username);
  }

  @CacheKey('soid')
  @CacheTTL(60 * 60) // 1h
  @UseInterceptors(CacheInterceptor)
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

  @UseInterceptors(SoInterceptor)
  @UseGuards(JwtGuard)
  @Post('/so')
  addSo(@GetUser('id') userId: number, @Body() soDto: NewSoDto) {
    return this.soService.addSo(userId, soDto);
  }

  @CacheKey('so')
  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so')
  getSo() {
    return this.soService.getSo();
  }

  @CacheKey('so')
  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get()
  get() {
    return this.soService.getSo();
  }
}
