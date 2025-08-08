import { useSelector } from 'react-redux';
import { useFolderPagination } from './useFolderPagination';
import {
  selectIsSearchActive,
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

  // Get the pagination data using the dynamic key
  const folderPagination = useSelector((state) =>
    state.dropbox?.paginationByFolder?.[paginationKey] || null,
  );

  // Reuse the existing useFolderPagination logic with the dynamic key
  const paginationHandlers = useFolderPagination(
    dataset,
    folderPagination,
    paginationKey,
  );

  return {
    ...paginationHandlers,
    isSearchActive,
    paginationKey,
    folderPagination,
  };
};