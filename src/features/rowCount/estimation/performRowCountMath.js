import { longitudeRangesOverlap } from '../../../shared/utility/longitudeRange';

function countDimension(rules, inputs, effective) {
  const rule = rules.find((r) => r.appliesWhen(inputs, effective));
  const value = rule ? rule.apply(inputs, effective) : 1;
  return Math.max(1, value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampSpatialBounds(queryBounds, datasetBounds) {
  if (
    queryBounds.latMin > datasetBounds.latMax ||
    queryBounds.latMax < datasetBounds.latMin
  ) {
    return null;
  }

  if (!longitudeRangesOverlap(
    queryBounds.lonMin,
    queryBounds.lonMax,
    datasetBounds.lonMin,
    datasetBounds.lonMax
  )) {
    return null;
  }

  const queryCrossesDateline = queryBounds.lonMin > queryBounds.lonMax;

  const clampedLatMin = clamp(
    queryBounds.latMin,
    datasetBounds.latMin,
    datasetBounds.latMax,
  );
  const clampedLatMax = clamp(
    queryBounds.latMax,
    datasetBounds.latMin,
    datasetBounds.latMax,
  );

  let clampedLonMin, clampedLonMax;

  const datasetCrossesDateline = datasetBounds.lonMin > datasetBounds.lonMax;

  if (queryCrossesDateline && datasetCrossesDateline) {
    clampedLonMin = Math.max(queryBounds.lonMin, datasetBounds.lonMin);
    clampedLonMax = Math.min(queryBounds.lonMax, datasetBounds.lonMax);
  } else if (queryCrossesDateline) {
    const overlapsEast = datasetBounds.lonMax >= queryBounds.lonMin;
    const overlapsWest = datasetBounds.lonMin <= queryBounds.lonMax;

    if (overlapsEast && overlapsWest) {
      clampedLonMin = Math.max(queryBounds.lonMin, datasetBounds.lonMin);
      clampedLonMax = Math.min(queryBounds.lonMax, datasetBounds.lonMax);
    } else if (overlapsEast) {
      clampedLonMin = Math.max(queryBounds.lonMin, datasetBounds.lonMin);
      clampedLonMax = datasetBounds.lonMax;
    } else {
      clampedLonMin = datasetBounds.lonMin;
      clampedLonMax = Math.min(queryBounds.lonMax, datasetBounds.lonMax);
    }
  } else {
    clampedLonMin = Math.max(queryBounds.lonMin, datasetBounds.lonMin);
    clampedLonMax = Math.min(queryBounds.lonMax, datasetBounds.lonMax);
  }

  return {
    latMin: clampedLatMin,
    latMax: clampedLatMax,
    lonMin: clampedLonMin,
    lonMax: clampedLonMax,
  };
}

function clampTemporalRange(queryRange, datasetRange) {
  const queryMin = new Date(queryRange.timeMin);
  const queryMax = new Date(queryRange.timeMax);
  const datasetMin = new Date(datasetRange.timeMin);
  const datasetMax = new Date(datasetRange.timeMax);

  if (queryMin > datasetMax || queryMax < datasetMin) {
    return null;
  }

  return {
    timeMin: new Date(Math.max(queryMin.getTime(), datasetMin.getTime())),
    timeMax: new Date(Math.min(queryMax.getTime(), datasetMax.getTime())),
  };
}

function clampDepthRange(queryRange, datasetRange) {
  if (
    queryRange.depthMin > datasetRange.depthMax ||
    queryRange.depthMax < datasetRange.depthMin
  ) {
    return null;
  }

  return {
    depthMin: clamp(queryRange.depthMin, datasetRange.depthMin, datasetRange.depthMax),
    depthMax: clamp(queryRange.depthMax, datasetRange.depthMin, datasetRange.depthMax),
  };
}

function clampAllBounds(inputs, constraints) {
  const { spatialBounds: dsBounds, temporalBounds: dsTemporal, depthBounds: dsDepth } = inputs;
  let effective = { ...constraints };

  const hasDatasetSpatialBounds =
    dsBounds.latMin !== null &&
    dsBounds.latMin !== undefined &&
    dsBounds.latMax !== null &&
    dsBounds.latMax !== undefined;

  if (hasDatasetSpatialBounds) {
    const clampedSpatial = clampSpatialBounds(constraints.spatialBounds, dsBounds);
    if (clampedSpatial === null) return null;
    effective.spatialBounds = clampedSpatial;
  }

  const hasTemporalConstraints =
    constraints.temporalEnabled &&
    constraints.temporalRange.timeMin &&
    constraints.temporalRange.timeMax;

  const hasDatasetTemporalBounds = dsTemporal.timeMin && dsTemporal.timeMax;

  if (hasTemporalConstraints && hasDatasetTemporalBounds) {
    const clampedTemporal = clampTemporalRange(constraints.temporalRange, dsTemporal);
    if (clampedTemporal === null) return null;
    effective.temporalRange = {
      timeMin: clampedTemporal.timeMin.toISOString(),
      timeMax: clampedTemporal.timeMax.toISOString(),
    };
  }

  const hasDepthConstraints =
    constraints.depthEnabled &&
    constraints.depthRange.depthMin !== null &&
    constraints.depthRange.depthMax !== null;

  const hasDatasetDepthBounds =
    dsDepth.depthMin !== null &&
    dsDepth.depthMin !== undefined &&
    dsDepth.depthMax !== null &&
    dsDepth.depthMax !== undefined;

  if (hasDepthConstraints && hasDatasetDepthBounds) {
    const clampedDepth = clampDepthRange(constraints.depthRange, dsDepth);
    if (clampedDepth === null) return null;
    effective.depthRange = clampedDepth;
  }

  return effective;
}

function countSpatialDataPoints(queryMin, queryMax, datasetMin, resolution) {
  const offsetToQueryMin = queryMin - datasetMin;
  const offsetToQueryMax = queryMax - datasetMin;
  const firstPointIndex = Math.ceil(offsetToQueryMin / resolution);
  const lastPointIndex = Math.floor(offsetToQueryMax / resolution);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

function calculateMonthlyCount(startDate, endDate) {
  const startYear = startDate.getUTCFullYear();
  const startMonth = startDate.getUTCMonth();
  const endYear = endDate.getUTCFullYear();
  const endMonth = endDate.getUTCMonth();
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

function calculateMonthlyClimatologyCount(startDate, endDate) {
  let totalMonths = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12
    + (endDate.getUTCMonth() - startDate.getUTCMonth());
  if (totalMonths >= 12) {
    return 12;
  }
  let startMonth = startDate.getUTCMonth();
  let endMonth = endDate.getUTCMonth();
  if (startMonth <= endMonth) {
    return endMonth - startMonth + 1;
  }
  return 12 - startMonth + endMonth + 1;
}

function calculateAnchoredCount(startDate, endDate, datasetStartDate, resolutionDays) {
  const datasetMin = new Date(datasetStartDate);
  const daysToQueryMin = (startDate - datasetMin) / 86400000;
  const daysToQueryMax = (endDate - datasetMin) / 86400000;
  const firstPointIndex = Math.ceil(daysToQueryMin / resolutionDays);
  const lastPointIndex = Math.floor(daysToQueryMax / resolutionDays);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

function calculateSimpleTemporalCount(startDate, endDate, resolutionDays) {
  const dayDiff = (endDate - startDate) / 86400000;
  const inclusiveDays = dayDiff + 1;
  return Math.ceil(inclusiveDays / resolutionDays);
}

// Rule arrays use first-match-wins: countDimension picks the first rule whose
// appliesWhen returns true. ORDER MATTERS — rules are arranged from most
// specific to least specific, with a catch-all default at the end.
//
// Each rule has an implicitlyExcludes predicate that documents which prior
// rules it depends on having already been checked. If you &&'d a rule's
// appliesWhen with its implicitlyExcludes, the result would be a fully
// self-contained predicate with no ordering dependency. If we want to switch to 
// idempotent execution (run all rules, exactly one matches), the 
// implicitlyExcludes predicates need test coverage first.

const latitudeRules = [
  {
    name: 'gridPointCounting',
    description: 'Count grid points based on spatial resolution',
    appliesWhen: () => true,
    implicitlyExcludes: () => true, // only rule
    apply: (inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { latMin, latMax } = effective.spatialBounds;
      return countSpatialDataPoints(latMin, latMax, dsBounds.latMin, resolutions.spatialDegrees);
    },
  },
];

function getLonOrigin(dsBounds) {
  return dsBounds.lonMin !== null && dsBounds.lonMin !== undefined
    ? dsBounds.lonMin
    : -180;
}

const longitudeRules = [
  {
    name: 'dateLineCrossing',
    description: 'Split calculation when query crosses the date line',
    appliesWhen: (inputs, effective) => effective.spatialBounds.lonMax < effective.spatialBounds.lonMin,
    implicitlyExcludes: () => true, // most specific lon rule
    apply: (inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { lonMin, lonMax } = effective.spatialBounds;
      const origin = getLonOrigin(dsBounds);
      const eastEnd = Math.min(180, dsBounds.lonMax);
      const westStart = Math.max(-180, dsBounds.lonMin);
      const countToDateLine = countSpatialDataPoints(lonMin, eastEnd, origin, resolutions.spatialDegrees);
      const countFromDateLine = countSpatialDataPoints(westStart, lonMax, origin, resolutions.spatialDegrees);
      return countToDateLine + countFromDateLine;
    },
  },
  {
    name: 'gridPointCounting',
    description: 'Count grid points based on spatial resolution',
    appliesWhen: () => true,
    implicitlyExcludes: (inputs, effective) => effective.spatialBounds.lonMax >= effective.spatialBounds.lonMin, // not dateline crossing
    apply: (inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { lonMin, lonMax } = effective.spatialBounds;
      return countSpatialDataPoints(lonMin, lonMax, getLonOrigin(dsBounds), resolutions.spatialDegrees);
    },
  },
];

const temporalRules = [
  {
    name: 'noConstraints_climatology',
    description: 'No temporal constraints + climatology = 12 months',
    appliesWhen: (inputs, effective) =>
      !effective.temporalEnabled && inputs.resolutions.isMonthlyClimatology,
    implicitlyExcludes: () => true, // most specific unconstrained rule
    apply: () => 12,
  },
  {
    name: 'noConstraints_withDatasetRange',
    description: 'No temporal constraints - use full dataset range',
    appliesWhen: (inputs, effective) =>
      !effective.temporalEnabled &&
      inputs.temporalBounds.timeMin &&
      inputs.temporalBounds.timeMax,
    implicitlyExcludes: (inputs) => !inputs.resolutions.isMonthlyClimatology, // caught by noConstraints_climatology
    apply: (inputs) => {
      const { resolutions, temporalBounds } = inputs;
      const date1 = new Date(temporalBounds.timeMin);
      const date2 = new Date(temporalBounds.timeMax);

      if (resolutions.temporalDays === 30) {
        return calculateMonthlyCount(date1, date2);
      }
      if ([3, 7, 8].includes(resolutions.temporalDays)) {
        return calculateAnchoredCount(date1, date2, temporalBounds.timeMin, resolutions.temporalDays);
      }
      return calculateSimpleTemporalCount(date1, date2, resolutions.temporalDays);
    },
  },
  {
    name: 'noConstraints_default',
    description: 'No temporal constraints and no dataset range = 1',
    appliesWhen: (inputs, effective) => !effective.temporalEnabled,
    implicitlyExcludes: (inputs) =>
      !inputs.resolutions.isMonthlyClimatology // caught by noConstraints_climatology
      && !(inputs.temporalBounds.timeMin && inputs.temporalBounds.timeMax), // caught by noConstraints_withDatasetRange
    apply: () => 1,
  },
  {
    name: 'climatology',
    description: 'Monthly climatology uses climatology month counting',
    appliesWhen: (inputs) => inputs.resolutions.isMonthlyClimatology,
    implicitlyExcludes: (inputs, effective) => effective.temporalEnabled, // unconstrained cases caught above
    apply: (inputs, effective) => {
      const date1 = new Date(effective.temporalRange.timeMin);
      const date2 = new Date(effective.temporalRange.timeMax);
      return calculateMonthlyClimatologyCount(date1, date2);
    },
  },
  {
    name: 'monthly',
    description: '30-day resolution uses calendar month counting',
    appliesWhen: (inputs) => inputs.resolutions.temporalDays === 30,
    implicitlyExcludes: (inputs, effective) =>
      effective.temporalEnabled // unconstrained caught above
      && !inputs.resolutions.isMonthlyClimatology, // caught by climatology
    apply: (inputs, effective) => {
      const date1 = new Date(effective.temporalRange.timeMin);
      const date2 = new Date(effective.temporalRange.timeMax);
      return calculateMonthlyCount(date1, date2);
    },
  },
  {
    name: 'anchored',
    description: '3/7/8-day resolutions use dataset start as anchor',
    appliesWhen: (inputs) =>
      [3, 7, 8].includes(inputs.resolutions.temporalDays) && inputs.temporalBounds.timeMin,
    implicitlyExcludes: (inputs, effective) =>
      effective.temporalEnabled // unconstrained caught above
      && !inputs.resolutions.isMonthlyClimatology // caught by climatology
      && inputs.resolutions.temporalDays !== 30, // caught by monthly
    apply: (inputs, effective) => {
      const date1 = new Date(effective.temporalRange.timeMin);
      const date2 = new Date(effective.temporalRange.timeMax);
      return calculateAnchoredCount(date1, date2, inputs.temporalBounds.timeMin, inputs.resolutions.temporalDays);
    },
  },
  {
    name: 'default',
    description: 'Simple day division for all other resolutions',
    appliesWhen: () => true,
    implicitlyExcludes: (inputs, effective) =>
      effective.temporalEnabled // unconstrained caught above
      && !inputs.resolutions.isMonthlyClimatology // caught by climatology
      && inputs.resolutions.temporalDays !== 30 // caught by monthly
      && !([3, 7, 8].includes(inputs.resolutions.temporalDays) && inputs.temporalBounds.timeMin), // caught by anchored
    apply: (inputs, effective) => {
      const date1 = new Date(effective.temporalRange.timeMin);
      const date2 = new Date(effective.temporalRange.timeMax);
      return calculateSimpleTemporalCount(date1, date2, inputs.resolutions.temporalDays);
    },
  },
];

const depthRules = [
  {
    name: 'noDepth',
    description: 'Dataset has no depth dimension',
    appliesWhen: (inputs) => !inputs.hasDepth,
    implicitlyExcludes: () => true, // most specific depth rule
    apply: () => 1,
  },
  {
    name: 'useProvidedCount',
    description: 'Use depth count from depth model query',
    appliesWhen: (inputs) => inputs.depthCountInRange > 0,
    implicitlyExcludes: (inputs) => inputs.hasDepth, // noDepth caught above
    apply: (inputs) => inputs.depthCountInRange,
  },
  {
    name: 'default',
    description: 'Default depth count of 1',
    appliesWhen: () => true,
    implicitlyExcludes: (inputs) => inputs.hasDepth && !(inputs.depthCountInRange > 0), // noDepth and useProvidedCount caught above
    apply: () => 1,
  },
];

function performRowCountMath(resolvedInputs, constraints) {
  const effective = clampAllBounds(resolvedInputs, constraints);
  if (!effective) return 0;

  const latCount = countDimension(latitudeRules, resolvedInputs, effective);
  const lonCount = countDimension(longitudeRules, resolvedInputs, effective);
  const temporalCount = countDimension(temporalRules, resolvedInputs, effective);
  const depthCount = countDimension(depthRules, resolvedInputs, effective);

  const tableCount = resolvedInputs.tableCount || 1;
  return Math.round(latCount * lonCount * temporalCount * depthCount * tableCount);
}

export {
  clampSpatialBounds,
  clampTemporalRange,
  clampDepthRange,
  countSpatialDataPoints,
  calculateMonthlyCount,
  calculateMonthlyClimatologyCount,
  latitudeRules,
  longitudeRules,
  temporalRules,
  depthRules,
};
export default performRowCountMath;
