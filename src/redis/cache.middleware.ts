import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { cacheKeyCreator, parseQueryParams } from '../util';
import { PaginationParams } from '../../types';
import { RedisService } from './redis.service';

/**
 * does the following:
 * 1. parses the query
 * 2. creates the cache key
 * 3. checks for a cache hit
 * 4. if cache hit, return data
 * 5. else, add 'query' & 'cacheKey' to req object & next()
 */
@Injectable()
export class CacheMiddleware implements NestMiddleware {
  private readonly logger;

  constructor(private cache: RedisService) {
    this.logger = new Logger(CacheMiddleware.name);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // this.logger.log(`middleware: ${req.path}`);

    this.logger.log(req.params['0']);

    const params: PaginationParams = parseQueryParams(
      req.query as unknown as string,
    );

    // this.logger.log(params);

    const cacheKey = cacheKeyCreator(req.params['0'], params);

    this.logger.log(`cacheKey: ${cacheKey}`);

    // get the data from the cache if exists
    const data = await this.cache.get(cacheKey);

    if (data) {
      this.logger.log('Cache HIT!');
      // this.logger.log(data);
      return res.json(data);
    }

    this.logger.log('Cache MISS!');
    req.body['params'] = params;
    req.body['cacheKey'] = cacheKey;
    next();
  }
}
