import { parseUTCDateString } from '../../../shared/filtering/utils/dateHelpers';

export function transformConstraintsForRowCount(filterValues) {
  if (!filterValues || !filterValues.isFiltered) {
    return null;
  }

  return {
    spatialBounds: {
      latMin: filterValues.latStart,
      latMax: filterValues.latEnd,
      lonMin: filterValues.lonStart,
      lonMax: filterValues.lonEnd,
    },
    temporalRange: {
      timeMin: filterValues.timeStart
        ? parseUTCDateString(filterValues.timeStart)
        : null,
      timeMax: filterValues.timeEnd
        ? parseUTCDateString(filterValues.timeEnd)
        : null,
    },
    depthRange: {
      depthMin: filterValues.depthStart,
      depthMax: filterValues.depthEnd,
    },
    temporalEnabled: Boolean(filterValues.timeStart || filterValues.timeEnd),
    depthEnabled:
      filterValues.depthStart != null || filterValues.depthEnd != null,
    includePartialOverlaps: true,
  };
}
