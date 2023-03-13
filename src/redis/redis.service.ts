import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisService {
  private readonly logger;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    this.logger = new Logger(RedisService.name);
  }

  async reset() {
    // this.logger.log('reset():');
    await this.cache.reset();
  }

  async get(key: string) {
    // this.logger.log('get():' + key);
    return await this.cache.get(key);
  }

  async set(key: string, val: any, ttl?: number) {
    // this.logger.log('set():' + key);
    // this.logger.log(val);
    await this.cache.set(key, val, ttl);
  }

  async clear(key: string) {
    // this.logger.log('clear():' + key);
    await this.cache.del(key);
  }

  /**
   *
   * @param key string
   * clears the cache based on the regex pattern (key + "*")
   */
  async clearAll(key?: string) {
    // this.logger.log('clearAll():' + key);
    if (!key || key.length == 0) {
      return await this.cache.reset();
    }

    const allKeys: string[] = await this.cache.store.keys(key + '*');
    for (const i in allKeys) {
      // this.logger.log(`del: ${allKeys[i]}`);
      await this.cache.del(allKeys[i]);
    }
  }
}
