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
    filters.lonEnd !== undefined ||
    filters.depthStart !== undefined ||
    filters.depthEnd !== undefined
  ) {
    apiFilters.spatial = {
      latMin: filters.latStart,
      latMax: filters.latEnd,
      lonMin: filters.lonStart,
      lonMax: filters.lonEnd,
    };
  }

  // Transform depth filters - add to spatial filter
  if (filters.depthStart !== undefined || filters.depthEnd !== undefined) {
    if (!apiFilters.spatial) {
      apiFilters.spatial = {};
    }
    apiFilters.spatial.depthMin = filters.depthStart;
    apiFilters.spatial.depthMax = filters.depthEnd;
  }

  return apiFilters;
};
