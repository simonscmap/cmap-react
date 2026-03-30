import { useState, useEffect, useMemo } from 'react';

const usePagination = ({ data, itemsPerPage = 10, rowsPerPageOptions = null }) => {
  let [currentPage, setCurrentPage] = useState(1);
  let [perPage, setPerPage] = useState(itemsPerPage);

  let validPerPage = perPage > 0 ? perPage : 10;

  let totalPages = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.ceil(data.length / validPerPage);
  }, [data, validPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  let paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    let startIndex = (currentPage - 1) * validPerPage;
    let endIndex = startIndex + validPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, validPerPage]);

  let handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  let handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  let paginationProps = useMemo(
    () => ({
      count: totalPages,
      page: currentPage,
      onChange: handlePageChange,
      shouldShow: totalPages > 1 || (rowsPerPageOptions && data && data.length > 0),
      rowsPerPageOptions: rowsPerPageOptions,
      rowsPerPage: validPerPage,
      onRowsPerPageChange: handlePerPageChange,
      totalItems: data ? data.length : 0,
    }),
    [totalPages, currentPage, validPerPage, rowsPerPageOptions, data],
  );

  return {
    paginatedData,
    paginationProps,
  };
};

export default usePagination;
