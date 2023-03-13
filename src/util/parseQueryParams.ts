import { PaginationParams } from '../../types';

/**
 *
 * @param query contains a query object with fields {skip, take, orderby, type}
 * @returns PaginationParams
 */
export function parseQueryParams(query: string): PaginationParams {
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
