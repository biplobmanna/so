import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { EditUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUser(userName: string) {
		try {
			return await this.prisma.user.findFirstOrThrow({
				where: {
					username: userName,
				},
				select: {
					email: true,
					username: true,
				},
			});
		} catch (err) {
			throw new BadRequestException('username not found!');
		}
	}

	async editUser(userId: number, dto: EditUserDto) {
		// check if the user exists
		try {
			await this.prisma.user.findFirstOrThrow({
				where: {
					id: userId,
				},
			});
		} catch (err) {
			throw new NotFoundException('user not found');
		}

		try {
			// update user data
			// since email & username are unique fields
			// conflict should raise exception
			return await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					...dto,
				},
				select: {
					id: true,
					username: true,
					email: true,
				},
			});
		} catch (error) {
			throw new BadRequestException('update data conflicts with existing data');
		}
	}
}
