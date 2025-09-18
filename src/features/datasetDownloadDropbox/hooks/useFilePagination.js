import { useDispatch } from 'react-redux';
import {
  setLocalPaginationPage,
  setLocalPaginationSize,
} from '../state/actions';

export const useFilePagination = (dataset, vaultFilesPagination) => {
  const dispatch = useDispatch();

  const handlePageChange = (direction) => {
    const { local, allCachedFiles, totalFileCount } = vaultFilesPagination;

    if (direction === 'next') {
      const nextPage = local.currentPage + 1;
      const requiredFiles = nextPage * local.pageSize;

      // Check if we have enough cached files for next page
      if (
        allCachedFiles.length >= requiredFiles ||
        allCachedFiles.length >= totalFileCount
      ) {
        dispatch(setLocalPaginationPage(nextPage));
      }
      // No backend fetching - only navigate if we have enough local files
    } else if (direction === 'prev' && local.currentPage > 1) {
      dispatch(setLocalPaginationPage(local.currentPage - 1));
    }
  };

  const handlePageSizeChange = (event, clearSelections) => {
    const newPageSize = parseInt(event.target.value);

    // Update local pagination with new page size
    dispatch(setLocalPaginationSize(newPageSize));

    // Clear selections when page size changes
    clearSelections();
  };

  return {
    handlePageChange,
    handlePageSizeChange,
  };
};
