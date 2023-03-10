import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { EditUserDto } from './dto';

/**
 * - **user**
  - PUBLIC :: GET `/user/:username` : get user by `username`
  - PROTECTED :: PATCH `/user/:username` : update user by `uid`
 */

@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get(':username')
	getUser(@Param('username') userName: string) {
		return this.userService.getUser(userName);
	}

	@UseGuards(JwtGuard)
	@Patch()
	editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
		return this.userService.editUser(userId, dto);
	}
}
