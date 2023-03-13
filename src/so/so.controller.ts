import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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
import { PaginationParams } from '../../types';
import { RedisService } from '../redis/redis.service';

@Controller()
export class SoController {
  private readonly logger;
  constructor(private soService: SoService, private redisCache: RedisService) {
    this.logger = new Logger(SoController.name);
  }

  @Get('/so/tag/:tag')
  async getSoByTag(
    @Param('tag') tag: string,
    @Body('params') params: PaginationParams,
    @Body('cacheKey') cacheKey: string,
  ) {
    const data = await this.soService.getSoByTag(tag, params);
    await this.redisCache.set(cacheKey, data);
    return data;
  }

  @Get('/so/users/:username')
  async getSoByUser(
    @Param('username') username: string,
    @Body('params') params: PaginationParams,
    @Body('cacheKey') cacheKey: string,
  ) {
    const data = await this.soService.getSoByUser(username, params);
    await this.redisCache.set(cacheKey, data);
    return data;
  }

  @Get('/so/:sid')
  async getSoById(
    @Param('sid', ParseIntPipe) sid: number,
    @Body('params') params: PaginationParams,
    @Body('cacheKey') cacheKey: string,
  ) {
    const data = await this.soService.getSoById(sid, params);
    await this.redisCache.set(cacheKey, data);
    return data;
  }

  @UseGuards(JwtGuard)
  @Patch('/so/:sid')
  async updateSoById(
    @GetUser('id') userId: number,
    @Param('sid', ParseIntPipe) soId: number,
    @Body() soDto: EditSoDto,
  ) {
    const response = await this.soService.updateSoById(userId, soId, soDto);
    await this.redisCache.clearAll('so');
    return response;
  }

  @UseGuards(JwtGuard)
  @Delete('/so/:sid')
  async deleteSoById(
    @GetUser('id') userId: number,
    @Param('sid', ParseIntPipe) soId: number,
  ) {
    const response = await this.soService.deleteSoById(userId, soId);
    await this.redisCache.clearAll('so');
    return response;
  }

  @UseInterceptors(SoInterceptor) // push msg to Websockets
  @UseGuards(JwtGuard)
  @Post('/so')
  async addSo(@GetUser('id') userId: number, @Body() soDto: NewSoDto) {
    const response = await this.soService.addSo(userId, soDto);
    await this.redisCache.clearAll('so');
    return response;
  }

  @Get('/so')
  async getSo(
    @Body('params') params: PaginationParams,
    @Body('cacheKey') cacheKey: string,
  ) {
    const data = await this.soService.getSo(params);
    await this.redisCache.set(cacheKey, data);
    return data;
  }

  @Get()
  // @Redirect('so', 301)
  async get(
    @Body('params') params: PaginationParams,
    @Body('cacheKey') cacheKey: string,
  ) {
    const data = await this.soService.getSo(params);
    await this.redisCache.set(cacheKey, data);
    return data;
  }
}
