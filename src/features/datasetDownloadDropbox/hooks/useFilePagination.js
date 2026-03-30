import { useDispatch } from 'react-redux';
import {
  setLocalPaginationPage,
  setLocalPaginationSize,
} from '../state/actions';

export const useFilePagination = (dataset, vaultFilesPagination) => {
  const dispatch = useDispatch();

  const handlePageChange = (directionOrPage) => {
    const { local, allCachedFiles, totalFileCount } = vaultFilesPagination;
    let targetPage;

    if (typeof directionOrPage === 'number') {
      targetPage = directionOrPage;
    } else if (directionOrPage === 'next') {
      targetPage = local.currentPage + 1;
    } else if (directionOrPage === 'prev') {
      targetPage = local.currentPage - 1;
    } else {
      return;
    }

    if (targetPage < 1) {
      return;
    }

    let requiredFiles = targetPage * local.pageSize;
    if (
      allCachedFiles.length >= requiredFiles ||
      allCachedFiles.length >= totalFileCount
    ) {
      dispatch(setLocalPaginationPage(targetPage));
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
