import {
  Body,
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { SoService } from './so.service';
import { EditSoDto, NewSoDto } from './dto';
import { SoInterceptor } from './so.interceptor';
import { Cache } from 'cache-manager';

@Controller()
export class SoController {
  constructor(
    private soService: SoService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so/tag/:tag')
  getSoByTag(@Param('tag') tag: string, @Query() query: string) {
    const params = this.soService.filterQueryParams(query);

    return this.soService.getSoByTag(tag, params);
  }

  @CacheTTL(10 * 60) // 10 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so/users/:username')
  getSoByUser(@Param('username') username: string, @Query() query: string) {
    const params = this.soService.filterQueryParams(query);
    return this.soService.getSoByUser(username, params);
  }

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
    const response = this.soService.updateSoById(userId, soId, soDto);
    this.cacheManager.reset();
    return response;
  }

  @UseGuards(JwtGuard)
  @Delete('/so/:sid')
  deleteSoById(
    @GetUser('id') userId: number,
    @Param('sid', ParseIntPipe) soId: number,
  ) {
    const response = this.soService.deleteSoById(userId, soId);
    this.cacheManager.reset();
    return response;
  }

  @UseInterceptors(SoInterceptor)
  @UseGuards(JwtGuard)
  @Post('/so')
  addSo(@GetUser('id') userId: number, @Body() soDto: NewSoDto) {
    const response = this.soService.addSo(userId, soDto);
    this.cacheManager.reset();
    return response;
  }

  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get('/so')
  getSo(@Query() query: string) {
    const params = this.soService.filterQueryParams(query);
    return this.soService.getSo(params);
  }

  @CacheTTL(5 * 60) // 5 mins
  @UseInterceptors(CacheInterceptor)
  @Get()
  get(@Query() query: string) {
    const params = this.soService.filterQueryParams(query);
    return this.soService.getSo(params);
  }
}
