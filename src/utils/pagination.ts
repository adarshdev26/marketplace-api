export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
  }
  
  export function getPagination(
    page?: number,
    limit?: number
  ): PaginationParams {
    const currentPage =
      page && page > 0 ? page : 1;
  
    const currentLimit =
      limit && limit > 0 ? limit : 10;
  
    return {
      page: currentPage,
      limit: currentLimit,
      skip:
        (currentPage - 1) *
        currentLimit,
    };
  }