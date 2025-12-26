/**
 * Row Count Estimation v3 - Pipeline with Phases Pattern
 *
 * Calculates estimated row count using a phased rule pipeline.
 * Each dimension (lat, lon, temporal, depth) has its own rules.
 *
 * Phases execute in order:
 * - CALCULATE: Compute base count (first matching rule wins)
 * - ADJUST: Dataset-specific tweaks (all matching rules apply)
 * - CAP: Universal limits (all matching rules apply)
 *
 * Adding a rule = adding an object to the appropriate rules array.
 */

import { parseUTCDateString } from '../../../shared/filtering/utils/dateHelpers';

// Helper to safely parse dates - handles both Date objects and strings
function toUTCDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  return parseUTCDateString(value);
}

// ============ PHASE DEFINITIONS ============

const PHASES = ['CALCULATE', 'ADJUST', 'CAP'];

/**
 * Execute rules for a dimension through all phases.
 * - CALCULATE phase: first matching rule wins
 * - ADJUST/CAP phases: all matching rules apply in order
 */
function executeRulePipeline(rules, inputs, effective, initialValue = null) {
  let value = initialValue;
  const appliedRules = [];

  for (const phase of PHASES) {
    const phaseRules = rules.filter((r) => r.phase === phase);

    if (phase === 'CALCULATE') {
      // First match wins
      const rule = phaseRules.find((r) => r.appliesWhen(inputs, effective, value));
      if (rule) {
        value = rule.apply(value, inputs, effective);
        appliedRules.push(rule.name);
      }
    } else {
      // All matching rules apply
      for (const rule of phaseRules) {
        if (rule.appliesWhen(inputs, effective, value)) {
          value = rule.apply(value, inputs, effective);
          appliedRules.push(rule.name);
        }
      }
    }
  }

  return { value, appliedRules };
}

// ============ UTILITIES ============

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ============ BOUNDS CLAMPING ============

function clampSpatialBounds(queryBounds, datasetBounds) {
  if (
    queryBounds.latMin > datasetBounds.latMax ||
    queryBounds.latMax < datasetBounds.latMin ||
    queryBounds.lonMin > datasetBounds.lonMax ||
    queryBounds.lonMax < datasetBounds.lonMin
  ) {
    return null;
  }

  return {
    latMin: clamp(queryBounds.latMin, datasetBounds.latMin, datasetBounds.latMax),
    latMax: clamp(queryBounds.latMax, datasetBounds.latMin, datasetBounds.latMax),
    lonMin: clamp(queryBounds.lonMin, datasetBounds.lonMin, datasetBounds.lonMax),
    lonMax: clamp(queryBounds.lonMax, datasetBounds.lonMin, datasetBounds.lonMax),
  };
}

function clampTemporalRange(queryRange, datasetRange) {
  const queryMin = toUTCDate(queryRange.timeMin);
  const queryMax = toUTCDate(queryRange.timeMax);
  const datasetMin = toUTCDate(datasetRange.timeMin);
  const datasetMax = toUTCDate(datasetRange.timeMax);

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

// ============ CALCULATION HELPERS ============

function countSpatialDataPoints(queryMin, queryMax, datasetMin, resolution) {
  const offsetToQueryMin = queryMin - datasetMin;
  const offsetToQueryMax = queryMax - datasetMin;
  const firstPointIndex = Math.ceil(offsetToQueryMin / resolution);
  const lastPointIndex = Math.floor(offsetToQueryMax / resolution);
  const count = lastPointIndex - firstPointIndex + 1;
  return count < 1 ? 1 : count;
}

function calculateClimatologyCount(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  return monthCount;
}

function calculateMonthlyCount(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

function calculateAnchoredCount(startDate, endDate, datasetStartDate, resolutionDays) {
  const datasetMin = toUTCDate(datasetStartDate);
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

// ============ LATITUDE RULES ============

const latitudeRules = [
  // CALCULATE: Base grid point counting
  {
    phase: 'CALCULATE',
    name: 'gridPointCounting',
    description: 'Count grid points based on spatial resolution',
    appliesWhen: () => true,
    apply: (value, inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { latMin, latMax } = effective.spatialBounds;
      return countSpatialDataPoints(latMin, latMax, dsBounds.latMin, resolutions.spatialDegrees);
    },
  },

  // CAP: Ensure minimum of 1
  {
    phase: 'CAP',
    name: 'ensureMinimumOne',
    description: 'Count is always at least 1',
    appliesWhen: () => true,
    apply: (value) => Math.max(1, value),
  },
];

// ============ LONGITUDE RULES ============

const longitudeRules = [
  // CALCULATE: Date line crossing
  {
    phase: 'CALCULATE',
    name: 'dateLineCrossing',
    description: 'Split calculation when query crosses the date line',
    appliesWhen: (inputs, effective) => effective.spatialBounds.lonMax < effective.spatialBounds.lonMin,
    apply: (value, inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { lonMin, lonMax } = effective.spatialBounds;
      const effectiveLonMin =
        dsBounds.lonMin !== null && dsBounds.lonMin !== undefined
          ? dsBounds.lonMin
          : dsBounds.latMin;
      const countToDateLine = countSpatialDataPoints(lonMin, 180, effectiveLonMin, resolutions.spatialDegrees);
      const countFromDateLine = countSpatialDataPoints(-180, lonMax, effectiveLonMin, resolutions.spatialDegrees);
      return countToDateLine + countFromDateLine;
    },
  },

  // CALCULATE: Default grid point counting
  {
    phase: 'CALCULATE',
    name: 'gridPointCounting',
    description: 'Count grid points based on spatial resolution',
    appliesWhen: () => true,
    apply: (value, inputs, effective) => {
      const { spatialBounds: dsBounds, resolutions } = inputs;
      const { lonMin, lonMax } = effective.spatialBounds;
      const effectiveLonMin =
        dsBounds.lonMin !== null && dsBounds.lonMin !== undefined
          ? dsBounds.lonMin
          : dsBounds.latMin;
      return countSpatialDataPoints(lonMin, lonMax, effectiveLonMin, resolutions.spatialDegrees);
    },
  },

  // CAP: Ensure minimum of 1
  {
    phase: 'CAP',
    name: 'ensureMinimumOne',
    description: 'Count is always at least 1',
    appliesWhen: () => true,
    apply: (value) => Math.max(1, value),
  },
];

// ============ TEMPORAL RULES ============

const temporalRules = [
  // CALCULATE: No temporal constraints - use dataset range or defaults
  {
    phase: 'CALCULATE',
    name: 'noConstraints_climatology',
    description: 'No temporal constraints + climatology = 12 months',
    appliesWhen: (inputs, effective) =>
      !effective.temporalEnabled && inputs.resolutions.isMonthlyClimatology,
    apply: () => 12,
  },
  {
    phase: 'CALCULATE',
    name: 'noConstraints_withDatasetRange',
    description: 'No temporal constraints - use full dataset range',
    appliesWhen: (inputs, effective) =>
      !effective.temporalEnabled &&
      inputs.temporalBounds.timeMin &&
      inputs.temporalBounds.timeMax,
    apply: (value, inputs) => {
      const { resolutions, temporalBounds } = inputs;
      const date1 = toUTCDate(temporalBounds.timeMin);
      const date2 = toUTCDate(temporalBounds.timeMax);

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
    phase: 'CALCULATE',
    name: 'noConstraints_default',
    description: 'No temporal constraints and no dataset range = 1',
    appliesWhen: (inputs, effective) => !effective.temporalEnabled,
    apply: () => 1,
  },

  // CALCULATE: With temporal constraints
  {
    phase: 'CALCULATE',
    name: 'climatology',
    description: 'Monthly climatology uses month counting',
    appliesWhen: (inputs) => inputs.resolutions.isMonthlyClimatology,
    apply: (value, inputs, effective) => {
      const date1 = toUTCDate(effective.temporalRange.timeMin);
      const date2 = toUTCDate(effective.temporalRange.timeMax);
      return calculateClimatologyCount(date1, date2);
    },
  },
  {
    phase: 'CALCULATE',
    name: 'monthly',
    description: '30-day resolution uses calendar month counting',
    appliesWhen: (inputs) => inputs.resolutions.temporalDays === 30,
    apply: (value, inputs, effective) => {
      const date1 = toUTCDate(effective.temporalRange.timeMin);
      const date2 = toUTCDate(effective.temporalRange.timeMax);
      return calculateMonthlyCount(date1, date2);
    },
  },
  {
    phase: 'CALCULATE',
    name: 'anchored',
    description: '3/7/8-day resolutions use dataset start as anchor',
    appliesWhen: (inputs) =>
      [3, 7, 8].includes(inputs.resolutions.temporalDays) && inputs.temporalBounds.timeMin,
    apply: (value, inputs, effective) => {
      const date1 = toUTCDate(effective.temporalRange.timeMin);
      const date2 = toUTCDate(effective.temporalRange.timeMax);
      return calculateAnchoredCount(date1, date2, inputs.temporalBounds.timeMin, inputs.resolutions.temporalDays);
    },
  },
  {
    phase: 'CALCULATE',
    name: 'default',
    description: 'Simple day division for all other resolutions',
    appliesWhen: () => true,
    apply: (value, inputs, effective) => {
      const date1 = toUTCDate(effective.temporalRange.timeMin);
      const date2 = toUTCDate(effective.temporalRange.timeMax);
      return calculateSimpleTemporalCount(date1, date2, inputs.resolutions.temporalDays);
    },
  },

  // CAP: Climatology never exceeds 12
  {
    phase: 'CAP',
    name: 'climatologyCap',
    description: 'Monthly climatology never exceeds 12 time points',
    appliesWhen: (inputs) => inputs.resolutions.isMonthlyClimatology,
    apply: (value) => Math.min(12, value),
  },

  // CAP: Ensure minimum of 1
  {
    phase: 'CAP',
    name: 'ensureMinimumOne',
    description: 'Count is always at least 1',
    appliesWhen: () => true,
    apply: (value) => Math.max(1, value),
  },
];

// ============ DEPTH RULES ============

const depthRules = [
  // CALCULATE: No depth data
  {
    phase: 'CALCULATE',
    name: 'noDepth',
    description: 'Dataset has no depth dimension',
    appliesWhen: (inputs) => !inputs.hasDepth,
    apply: () => 1,
  },

  // CALCULATE: Use provided depth count
  {
    phase: 'CALCULATE',
    name: 'useProvidedCount',
    description: 'Use depth count from depth model query',
    appliesWhen: (inputs) => inputs.depthCountInRange > 0,
    apply: (value, inputs) => inputs.depthCountInRange,
  },

  // CALCULATE: Default
  {
    phase: 'CALCULATE',
    name: 'default',
    description: 'Default depth count of 1',
    appliesWhen: () => true,
    apply: () => 1,
  },

  // CAP: Ensure minimum of 1
  {
    phase: 'CAP',
    name: 'ensureMinimumOne',
    description: 'Count is always at least 1',
    appliesWhen: () => true,
    apply: (value) => Math.max(1, value),
  },
];

// ============ ORCHESTRATOR ============

/**
 * Row Count Estimation v3 - Pipeline with Phases Pattern
 *
 * Orchestrates dimension rule pipelines to calculate estimated row count.
 * Each dimension runs through CALCULATE -> ADJUST -> CAP phases.
 *
 * @param {Object} resolvedInputs - Pre-resolved dataset inputs
 * @param {Object} constraints - Store constraints object
 * @returns {number} Estimated row count
 */
function performRowCountMathV3(resolvedInputs, constraints) {
  // Clamp all bounds to dataset coverage
  const effective = clampAllBounds(resolvedInputs, constraints);
  if (!effective) return 0;

  // Execute rule pipeline for each dimension
  const lat = executeRulePipeline(latitudeRules, resolvedInputs, effective);
  const lon = executeRulePipeline(longitudeRules, resolvedInputs, effective);
  const temporal = executeRulePipeline(temporalRules, resolvedInputs, effective);
  const depth = executeRulePipeline(depthRules, resolvedInputs, effective);

  // Final calculation
  const tableCount = resolvedInputs.tableCount || 1;
  return Math.round(lat.value * lon.value * temporal.value * depth.value * tableCount);
}

export default performRowCountMathV3;

// Export rules for introspection/documentation
export { latitudeRules, longitudeRules, temporalRules, depthRules, PHASES };
