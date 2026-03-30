import React from 'react';
import Pagination from '../../../../shared/pagination/Pagination';

let PaginationControls = ({
  currentPage = 1,
  totalPages = null,
  pageSize = 25,
  pageSizeOptions = [25, 50, 100, 250],
  onPageChange,
  onPageSizeChange,
}) => {
  let handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  return (
    <Pagination
      count={totalPages || 1}
      page={currentPage}
      onChange={handlePageChange}
      rowsPerPageOptions={pageSizeOptions}
      rowsPerPage={pageSize}
      onRowsPerPageChange={onPageSizeChange}
    />
  );
};

export default PaginationControls;
