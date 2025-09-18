import { useDispatch } from 'react-redux';
import {
  setLocalPaginationPage,
  setLocalPaginationSize,
} from '../state/actions';

export const useFolderPagination = (dataset, folderPagination, folderType) => {
  const dispatch = useDispatch();

  const handlePageChange = (direction) => {
    if (!folderPagination) {
      return;
    }

    const { local, allCachedFiles, totalFileCount } = folderPagination;

    if (direction === 'next') {
      const nextPage = local.currentPage + 1;
      const requiredFiles = nextPage * local.pageSize;

      // Check if we have enough cached files for next page
      if (
        allCachedFiles.length >= requiredFiles ||
        allCachedFiles.length >= totalFileCount
      ) {
        dispatch(setLocalPaginationPage(nextPage, folderType));
      }
      // No backend fetching - only navigate if we have enough local files
    } else if (direction === 'prev' && local.currentPage > 1) {
      dispatch(setLocalPaginationPage(local.currentPage - 1, folderType));
    }
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value);

    // Update local pagination with new page size
    dispatch(setLocalPaginationSize(newPageSize, folderType));
  };

  return {
    handlePageChange,
    handlePageSizeChange,
  };
};
