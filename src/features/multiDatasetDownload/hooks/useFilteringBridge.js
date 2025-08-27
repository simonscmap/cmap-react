import { useEffect } from 'react';
import { dayToDateString } from '../../../shared/filtering/dateHelpers';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';

/**
 * Bridge hook that synchronizes useSubsetFiltering state with Zustand store
 * Implements one-way sync: useSubsetFiltering -> Zustand store
 *
 * @param {Object} subsetFiltering - Result from useSubsetFiltering hook
 */
const useFilteringBridge = (subsetFiltering) => {
  const { setFilters } = useMultiDatasetDownloadStore();

  // Transform and sync filters whenever subsetFiltering state changes
  useEffect(() => {
    if (!subsetFiltering?.filterValues) {
      return;
    }

    const { filterValues } = subsetFiltering;

    // Transform temporal filters from days to date strings for API
    const temporal =
      filterValues.isFiltered &&
      filterValues.Time_Min &&
      filterValues.timeStart !== undefined &&
      filterValues.timeEnd !== undefined
        ? {
            startDate: dayToDateString(
              filterValues.Time_Min,
              filterValues.timeStart,
            ),
            endDate: dayToDateString(
              filterValues.Time_Min,
              filterValues.timeEnd,
            ),
            timeMin: filterValues.Time_Min,
            timeMax: subsetFiltering.datasetFilterBounds.timeMax,
            timeStart: filterValues.timeStart,
            timeEnd: filterValues.timeEnd,
          }
        : null;

    // Transform spatial filters (lat/lon are already in correct format)
    const spatial =
      filterValues.isFiltered &&
      (filterValues.latStart !== undefined ||
        filterValues.latEnd !== undefined ||
        filterValues.lonStart !== undefined ||
        filterValues.lonEnd !== undefined)
        ? {
            latStart: filterValues.latStart,
            latEnd: filterValues.latEnd,
            lonStart: filterValues.lonStart,
            lonEnd: filterValues.lonEnd,
          }
        : null;

    // Transform depth filters (already in correct format)
    const depth =
      filterValues.isFiltered &&
      (filterValues.depthStart !== undefined ||
        filterValues.depthEnd !== undefined)
        ? {
            depthStart: filterValues.depthStart,
            depthEnd: filterValues.depthEnd,
          }
        : null;

    // Update Zustand store with transformed filters
    setFilters({
      temporal,
      spatial,
      depth,
    });
  }, [
    subsetFiltering?.filterValues?.isFiltered,
    subsetFiltering?.filterValues?.Time_Min,
    subsetFiltering?.datasetFilterBounds?.timeMax,
    subsetFiltering?.filterValues?.timeStart,
    subsetFiltering?.filterValues?.timeEnd,
    subsetFiltering?.filterValues?.latStart,
    subsetFiltering?.filterValues?.latEnd,
    subsetFiltering?.filterValues?.lonStart,
    subsetFiltering?.filterValues?.lonEnd,
    subsetFiltering?.filterValues?.depthStart,
    subsetFiltering?.filterValues?.depthEnd,
    setFilters,
  ]);

  // Return current filter state for debugging/monitoring purposes
  return {
    isConnected: !!subsetFiltering?.filterValues,
    hasFilters: subsetFiltering?.filterValues?.isFiltered || false,
  };
};

export default useFilteringBridge;
