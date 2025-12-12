import { dateToDateString, dateToEndOfDayString } from './dateHelpers';

// Small epsilon for floating-point comparison tolerance
// Ensures we capture boundary values that may have floating-point precision differences
// Value of 0.000001 (~11cm for lat/lon, 1 micrometer for depth) is well below
// oceanographic measurement precision while handling binary floating-point errors
const SPATIAL_EPSILON = 0.000001;

const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

// Expand spatial bounds by epsilon to account for floating-point precision
// For example: 32.108 in metadata might be 32.10800000000004 in actual data
const expandSpatialBounds = (min, max) => ({
  min: min - SPATIAL_EPSILON,
  max: max + SPATIAL_EPSILON,
});

const clampToRange = (value, min, max) => Math.max(min, Math.min(max, value));

export const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - convert Date objects to date strings
  // Use dateToEndOfDayString for endDate to include the entire last day (T23:59:59)
  if (filters.Time_Min) {
    apiFilters.temporal = {
      startDate: dateToDateString(filters.timeStart),
      endDate: dateToEndOfDayString(filters.timeEnd),
    };
  }

  // Transform spatial filters - map to API format
  // Expand bounds by epsilon to handle floating-point precision issues
  if (
    filters.latStart !== undefined ||
    filters.latEnd !== undefined ||
    filters.lonStart !== undefined ||
    filters.lonEnd !== undefined ||
    filters.depthStart !== undefined ||
    filters.depthEnd !== undefined
  ) {
    const latBounds = expandSpatialBounds(filters.latStart, filters.latEnd);
    const lonBounds = expandSpatialBounds(filters.lonStart, filters.lonEnd);

    apiFilters.spatial = {
      latMin: clampToRange(latBounds.min, LAT_MIN, LAT_MAX),
      latMax: clampToRange(latBounds.max, LAT_MIN, LAT_MAX),
      lonMin: clampToRange(lonBounds.min, LON_MIN, LON_MAX),
      lonMax: clampToRange(lonBounds.max, LON_MIN, LON_MAX),
    };
  }

  // Transform depth filters - add to spatial filter
  if (filters.depthStart !== undefined || filters.depthEnd !== undefined) {
    if (!apiFilters.spatial) {
      apiFilters.spatial = {};
    }
    const depthBounds = expandSpatialBounds(
      filters.depthStart,
      filters.depthEnd,
    );
    apiFilters.spatial.depthMin = depthBounds.min;
    apiFilters.spatial.depthMax = depthBounds.max;
  }

  return apiFilters;
};
