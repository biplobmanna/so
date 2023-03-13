import { PaginationParams } from '../../types';
/**
 *
 * @param url the url string
 * @param params valid pagination parameter object
 * @returns a valid cache key
 *
 * combine the url & valid parsed pagination params to form a redis key
 */
export function cacheKeyCreator(
  url: string,
  params?: PaginationParams,
): string {
  // parse /path/ => /path
  // /path => /path (remains same)
  let cacheKey: string;

  if (!url || url.length == 0) {
    cacheKey = 'so';
  } else if (url.lastIndexOf('/') == url.length - 1) {
    cacheKey = url.substring(0, url.length - 1);
  } else {
    cacheKey = url;
  }

  if (!params) {
    return cacheKey; // incase there are no parameters
  }

  if (params['skip']) {
    cacheKey += '-skip=';
    cacheKey += params['skip'];
  }
  if (params['take']) {
    cacheKey += '-take=';
    cacheKey += params['take'];
  }
  for (const j in params['orderBy']) {
    cacheKey += '-orderby=';
    cacheKey += j;
    cacheKey += '-type=';
    cacheKey += params['orderBy'][j];
  }

  return cacheKey;
}
