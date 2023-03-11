import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditSoDto, NewSoDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class SoService {
  constructor(private prisma: PrismaService) {}

  async addSo(userId: number, soDto: NewSoDto) {
    // check user exists
    try {
      await this.prisma.user.findFirstOrThrow({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new NotFoundException('user does not exist!');
    }

    // add new so
    return await this.prisma.so.create({
      data: {
        userId,
        ...soDto,
      },
      select: {
        id: true,
        content: true,
        tag: true,
      },
    });
  }

  async getSo() {
    return await this.prisma.so.findMany({
      select: {
        content: true,
        tag: true,
      },
    });
  }

  async getSoById(soId: number) {
    try {
      return await this.prisma.so.findFirstOrThrow({
        where: {
          id: soId,
        },
        select: {
          id: true,
          content: true,
          tag: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('so does not exist!');
    }
  }

  async getSoByTag(tag: string) {
    return await this.prisma.so.findMany({
      where: {
        tag,
      },
      select: {
        id: true,
        content: true,
        tag: true,
      },
    });
  }

  async getSoByUser(username: string) {
    // check if user exists
    let user: User;
    console.log(username);
    try {
      user = await this.prisma.user.findFirstOrThrow({
        where: {
          username: username,
        },
      });
    } catch (error) {
      throw new NotFoundException('user does not exist!');
    }
    // find all so for that user
    return await this.prisma.so.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
        tag: true,
      },
    });
  }

  async updateSoById(userId: number, soId: number, soDto: EditSoDto) {
    // check if user exists
    try {
      await this.prisma.user.findFirstOrThrow({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      throw new NotFoundException('user does not exist!');
    }

    // check if so exists
    try {
      await this.prisma.so.findFirstOrThrow({
        where: {
          id: soId,
        },
      });
    } catch (error) {
      throw new NotFoundException('so does not exist!');
    }

    // update so
    return await this.prisma.so.update({
      where: {
        id: soId,
      },
      data: {
        ...soDto,
      },
      select: {
        id: true,
        content: true,
        tag: true,
      },
    });
  }

  async deleteSoById(userId: number, soId: number) {
    return await this.prisma.so.deleteMany({
      where: {
        id: soId,
        userId,
      },
    });
  }
}
