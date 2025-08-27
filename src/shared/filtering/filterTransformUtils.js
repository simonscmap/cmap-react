import { dayToDateString } from './dateHelpers';

/**
 * Transform useSubsetFiltering state into API-compatible filter format
 * @param {Object} subsetFiltering - Result from useSubsetFiltering hook
 * @returns {Object} Transformed filters for API consumption
 */
export const transformSubsetFiltersForAPI = (subsetFiltering) => {
  if (!subsetFiltering?.filterValues) {
    return {
      temporal: null,
      spatial: null,
      depth: null,
    };
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
          endDate: dayToDateString(filterValues.Time_Min, filterValues.timeEnd),
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

  return {
    temporal,
    spatial,
    depth,
  };
};
