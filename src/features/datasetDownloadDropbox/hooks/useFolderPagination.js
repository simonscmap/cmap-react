import { useDispatch } from 'react-redux';
import {
  setLocalPaginationPage,
  setLocalPaginationSize,
} from '../state/actions';

export const useFolderPagination = (dataset, folderPagination, folderType) => {
  const dispatch = useDispatch();

  const handlePageChange = (directionOrPage) => {
    if (!folderPagination) {
      return;
    }

    const { local, allCachedFiles, totalFileCount } = folderPagination;
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
      dispatch(setLocalPaginationPage(targetPage, folderType));
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
