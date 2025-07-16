import { useDispatch } from 'react-redux';
import {
  fetchVaultFilesPage,
  setLocalPaginationPage,
  setLocalPaginationSize,
} from '../state/actions';

export const useFolderPagination = (dataset, folderPagination, folderType) => {
  const dispatch = useDispatch();

  const handlePageChange = (direction) => {
    if (!folderPagination) {
      return;
    }

    const { local, backend, allCachedFiles, totalFileCount } = folderPagination;

    if (direction === 'next') {
      const nextPage = local.currentPage + 1;
      const requiredFiles = nextPage * local.pageSize;

      // Check if we have enough cached files
      if (
        allCachedFiles.length >= requiredFiles ||
        allCachedFiles.length >= totalFileCount
      ) {
        // Use local pagination
        dispatch(setLocalPaginationPage(nextPage, folderType));
      } else if (backend.hasMore) {
        // Fetch more from backend
        dispatch(
          fetchVaultFilesPage(dataset.Short_Name, {
            cursor: backend.cursor,
            folderType,
          }),
        );
      }
    } else if (direction === 'prev' && local.currentPage > 1) {
      // Always use local pagination for previous
      dispatch(setLocalPaginationPage(local.currentPage - 1, folderType));
    }
  };

  const handlePageSizeChange = (event, clearSelections) => {
    const newPageSize = parseInt(event.target.value);

    // Update local pagination with new page size
    dispatch(setLocalPaginationSize(newPageSize, folderType));

    // Clear selections when page size changes
    clearSelections();
  };

  return {
    handlePageChange,
    handlePageSizeChange,
  };
};