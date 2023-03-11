import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditSoDto, NewSoDto } from './dto';
import { User } from '@prisma/client';
import { PaginationParams } from '../../types';

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

  async getSo(params?: PaginationParams) {
    return await this.prisma.so.findMany({
      select: {
        content: true,
        tag: true,
      },
      ...params,
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

  async getSoByTag(tag: string, params?: PaginationParams) {
    return await this.prisma.so.findMany({
      where: {
        tag,
      },
      select: {
        id: true,
        content: true,
        tag: true,
      },
      ...params,
    });
  }

  async getSoByUser(username: string, params?: PaginationParams) {
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
      ...params,
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

  filterQueryParams(query: string): PaginationParams {
    const params: PaginationParams = {
      orderBy: {},
    };
    if (query['skip']) {
      try {
        params['skip'] = parseInt(query['skip']);
      } catch (error) {}
    }
    if (query['take']) {
      try {
        params['take'] = parseInt(query['take']);
      } catch (error) {}
    }

    if (
      query['orderby'] === 'id' ||
      query['orderby'] === 'userId' ||
      query['orderby'] === 'tag'
    ) {
      const type: string = query['type'] === 'desc' ? 'desc' : 'asc';
      params['orderBy'][query['orderby']] = type;
    }

    return params;
  }
}
