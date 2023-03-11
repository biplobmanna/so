export type PaginationParams = {
  take?: number;
  skip?: number;
  orderBy?: {
    id?: 'asc' | 'desc';
    tag?: 'asc' | 'desc';
    userId?: 'asc' | 'desc';
  };
};
