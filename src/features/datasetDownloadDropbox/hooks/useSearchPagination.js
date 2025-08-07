import { useSelector } from 'react-redux';
import { useFolderPagination } from './useFolderPagination';
import {
  selectIsSearchActive,
  selectSearchPaginationContext,
  selectActivePaginationContext,
} from '../state/selectors';

export const useSearchPagination = (dataset, activeTab) => {
  // Determine if search is active
  const isSearchActive = useSelector((state) =>
    selectIsSearchActive(state, activeTab),
  );

  // Get the appropriate pagination context key
  const paginationKey = useSelector((state) =>
    selectActivePaginationContext(state, activeTab),
  );

  // Get the search pagination context if search is active
  const searchPagination = useSelector((state) =>
    isSearchActive ? selectSearchPaginationContext(state, activeTab) : null,
  );

  // Get regular folder pagination if search is not active
  const folderPagination = useSelector((state) =>
    !isSearchActive
      ? state.dropbox.paginationByFolder[activeTab]
      : null,
  );

  // Use the appropriate pagination data
  const activePagination = isSearchActive ? searchPagination : folderPagination;

  // Reuse the existing useFolderPagination logic with the dynamic key
  const paginationHandlers = useFolderPagination(
    dataset,
    activePagination,
    paginationKey,
  );

  return {
    ...paginationHandlers,
    isSearchActive,
    paginationKey,
    activePagination,
  };
};