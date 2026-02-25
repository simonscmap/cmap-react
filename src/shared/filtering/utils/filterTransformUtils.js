import { dateToUTCDateString, dateToUTCEndOfDayString } from './dateHelpers';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

const clampToRange = (value, min, max) => Math.max(min, Math.min(max, value));

export const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - convert Date objects to UTC date strings
  // Use dateToUTCEndOfDayString for endDate to include the entire last day (T23:59:59)
  if (filters.Time_Min) {
    apiFilters.temporal = {
      startDate: dateToUTCDateString(filters.timeStart),
      endDate: dateToUTCEndOfDayString(filters.timeEnd),
    };
  }

  if (
    filters.latStart !== undefined ||
    filters.latEnd !== undefined ||
    filters.lonStart !== undefined ||
    filters.lonEnd !== undefined ||
    filters.depthStart !== undefined ||
    filters.depthEnd !== undefined
  ) {
    apiFilters.spatial = {
      latMin: clampToRange(filters.latStart, LAT_MIN, LAT_MAX),
      latMax: clampToRange(filters.latEnd, LAT_MIN, LAT_MAX),
      lonMin: clampToRange(filters.lonStart, LON_MIN, LON_MAX),
      lonMax: clampToRange(filters.lonEnd, LON_MIN, LON_MAX),
    };
  }

  if (filters.depthStart !== undefined || filters.depthEnd !== undefined) {
    if (!apiFilters.spatial) {
      apiFilters.spatial = {};
    }
    apiFilters.spatial.depthMin = filters.depthStart;
    apiFilters.spatial.depthMax = filters.depthEnd;
  }

  return apiFilters;
};
