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
    if (!subsetFiltering?.subsetParams) {
      return;
    }

    const { subsetParams } = subsetFiltering;

    // Transform temporal filters from days to date strings for API
    const temporal =
      subsetParams.subsetIsDefined &&
      subsetParams.Time_Min &&
      subsetParams.timeStart !== undefined &&
      subsetParams.timeEnd !== undefined
        ? {
            startDate: dayToDateString(
              subsetParams.Time_Min,
              subsetParams.timeStart,
            ),
            endDate: dayToDateString(
              subsetParams.Time_Min,
              subsetParams.timeEnd,
            ),
            timeMin: subsetParams.Time_Min,
            timeMax: subsetParams.Time_Max,
            timeStart: subsetParams.timeStart,
            timeEnd: subsetParams.timeEnd,
          }
        : null;

    // Transform spatial filters (lat/lon are already in correct format)
    const spatial =
      subsetParams.subsetIsDefined &&
      (subsetParams.latStart !== undefined ||
        subsetParams.latEnd !== undefined ||
        subsetParams.lonStart !== undefined ||
        subsetParams.lonEnd !== undefined)
        ? {
            latStart: subsetParams.latStart,
            latEnd: subsetParams.latEnd,
            lonStart: subsetParams.lonStart,
            lonEnd: subsetParams.lonEnd,
          }
        : null;

    // Transform depth filters (already in correct format)
    const depth =
      subsetParams.subsetIsDefined &&
      (subsetParams.depthStart !== undefined ||
        subsetParams.depthEnd !== undefined)
        ? {
            depthStart: subsetParams.depthStart,
            depthEnd: subsetParams.depthEnd,
          }
        : null;

    // Update Zustand store with transformed filters
    setFilters({
      temporal,
      spatial,
      depth,
    });
  }, [
    subsetFiltering?.subsetParams?.subsetIsDefined,
    subsetFiltering?.subsetParams?.Time_Min,
    subsetFiltering?.subsetParams?.Time_Max,
    subsetFiltering?.subsetParams?.timeStart,
    subsetFiltering?.subsetParams?.timeEnd,
    subsetFiltering?.subsetParams?.latStart,
    subsetFiltering?.subsetParams?.latEnd,
    subsetFiltering?.subsetParams?.lonStart,
    subsetFiltering?.subsetParams?.lonEnd,
    subsetFiltering?.subsetParams?.depthStart,
    subsetFiltering?.subsetParams?.depthEnd,
    setFilters,
  ]);

  // Return current filter state for debugging/monitoring purposes
  return {
    isConnected: !!subsetFiltering?.subsetParams,
    hasFilters: subsetFiltering?.subsetParams?.subsetIsDefined || false,
  };
};

export default useFilteringBridge;
