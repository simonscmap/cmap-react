import { useDispatch } from 'react-redux';
import { fetchVaultFilesPage } from '../../../../../Redux/actions/dropbox';

export const useFilePagination = (dataset, vaultFilesPagination) => {
  const dispatch = useDispatch();

  const handlePageChange = (direction) => {
    if (direction === 'next' && vaultFilesPagination.hasMore) {
      dispatch(
        fetchVaultFilesPage(dataset.Short_Name, {
          cursor: vaultFilesPagination.cursor,
          pageSize: vaultFilesPagination.pageSize,
        }),
      );
    } else if (direction === 'prev' && vaultFilesPagination.page > 1) {
      dispatch(
        fetchVaultFilesPage(dataset.Short_Name, {
          page: vaultFilesPagination.page - 1,
          pageSize: vaultFilesPagination.pageSize,
        }),
      );
    }
  };

  const handlePageSizeChange = (event, clearSelections) => {
    const newPageSize = event.target.value;
    dispatch(
      fetchVaultFilesPage(dataset.Short_Name, {
        page: 1,
        pageSize: newPageSize,
      }),
    );
    clearSelections();
  };

  return {
    handlePageChange,
    handlePageSizeChange,
  };
};