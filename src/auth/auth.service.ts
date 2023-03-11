import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Jwt } from '../../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: SigninDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user DNE
    if (!user) throw new ForbiddenException('Credentials Incorrect');

    // compare password
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) throw new ForbiddenException('Incorrect Password');

    return {
      id: user.id,
      email: user.email,
      access_token: await this.signToken(user.id, user.email),
    };
  }

  async signup(dto: SignupDto) {
    // console.log(dto);

    try {
      // generate the password hash
      const passwordHash = await argon.hash(dto.password);

      // save the new user in the db
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          hash: passwordHash,
        },
      });
      delete newUser.hash;
      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        access_token: await this.signToken(newUser.id, newUser.email),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Duplicate Credentials!');
        }
      }
      throw error;
    }
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload: Jwt = {
      sub: userId,
      email,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
