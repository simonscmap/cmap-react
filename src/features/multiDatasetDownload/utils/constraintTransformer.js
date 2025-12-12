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
      timeMin: filterValues.timeStart ? new Date(filterValues.timeStart) : null,
      timeMax: filterValues.timeEnd ? new Date(filterValues.timeEnd) : null,
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
