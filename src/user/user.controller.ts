import {
  Body,
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto';
import { PaginationParams } from '../../types';
import { RedisService } from '../redis/redis.service';

/**
 * - **user**
  - PUBLIC :: GET `/user/:username` : get user by `username`
  - PROTECTED :: PATCH `/user/:username` : update user by `uid`
 */

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  // @CacheTTL(10 * 60) // 10mins
  // @UseInterceptors(CacheInterceptor) // auto caching
  @Get(':username')
  async getUser(
    @Param('username') userName: string,
    @Body('cacheKey') cacheKey: string,
  ) {
    const user = await this.userService.getUser(userName);
    await this.redisService.set(cacheKey, user);
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch()
  async editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    const user = await this.userService.editUser(userId, dto);
    await this.redisService.clear('/users/' + user.username);
    return user;
  }
}
