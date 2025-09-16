import { dateToDateString } from './dateHelpers';

export const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - convert Date objects to date strings
  if (filters.Time_Min) {
    apiFilters.temporal = {
      startDate: dateToDateString(filters.timeStart),
      endDate: dateToDateString(filters.timeEnd),
    };
  }

  // Transform spatial filters - map to API format
  if (
    filters.latStart !== undefined ||
    filters.latEnd !== undefined ||
    filters.lonStart !== undefined ||
    filters.lonEnd !== undefined
  ) {
    apiFilters.spatial = {
      latMin: filters.latStart,
      latMax: filters.latEnd,
      lonMin: filters.lonStart,
      lonMax: filters.lonEnd,
    };
  }

  // Transform depth filters - map to API format
  if (filters.depthStart !== undefined || filters.depthEnd !== undefined) {
    apiFilters.depth = {
      min: filters.depthStart,
      max: filters.depthEnd,
    };
  }

  return apiFilters;
};
