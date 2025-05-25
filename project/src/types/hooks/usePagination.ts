import { useState, useMemo } from 'react';

interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>(items: T[], options: PaginationOptions = {}) {
  const { itemsPerPage = 5, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Reset to first page when items change
  useMemo(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
  };
}