import { areConstraintsEqual } from './constraintComparison';

function isValidTemporalRange(constraints) {
  if (!constraints.temporalEnabled) {
    return true;
  }

  if (!constraints.temporalRange) {
    return false;
  }

  var timeMin = constraints.temporalRange.timeMin;
  var timeMax = constraints.temporalRange.timeMax;

  if (!timeMin || !timeMax) {
    return false;
  }

  return true;
}

function isValidDepthRange(constraints) {
  if (!constraints.depthEnabled) {
    return true;
  }

  if (!constraints.depthRange) {
    return false;
  }

  var depthMin = constraints.depthRange.depthMin;
  var depthMax = constraints.depthRange.depthMax;

  if (depthMin === null || depthMin === undefined) {
    return false;
  }
  if (depthMax === null || depthMax === undefined) {
    return false;
  }

  return true;
}

function checkStaleness(
  shortName,
  currentConstraints,
  snapshot,
  datasetUtilization,
  lastDatasetIds,
  existingRowCount,
) {
  var utilization =
    datasetUtilization !== undefined && datasetUtilization !== null
      ? datasetUtilization
      : 1;

  if (lastDatasetIds && lastDatasetIds.size > 0) {
    if (!lastDatasetIds.has(shortName)) {
      return { isStale: true, reason: 'dataset_not_in_results' };
    }
  }

  if (!snapshot) {
    if (currentConstraints.temporalEnabled) {
      if (isValidTemporalRange(currentConstraints)) {
        return { isStale: true, reason: 'temporal_enabled' };
      }
    }

    if (currentConstraints.depthEnabled) {
      if (isValidDepthRange(currentConstraints)) {
        return { isStale: true, reason: 'depth_enabled' };
      }
    }

    if (utilization < 1) {
      return { isStale: true, reason: 'spatial_partial' };
    }

    return { isStale: false, reason: null };
  }

  if (
    currentConstraints.temporalEnabled &&
    !isValidTemporalRange(currentConstraints)
  ) {
    return { isStale: false, reason: null };
  }

  if (
    currentConstraints.depthEnabled &&
    !isValidDepthRange(currentConstraints)
  ) {
    return { isStale: false, reason: null };
  }

  if (!areConstraintsEqual(currentConstraints, snapshot)) {
    return { isStale: true, reason: 'constraints_changed' };
  }

  return { isStale: false, reason: null };
}

function getStaleDatasets(
  shortNames,
  currentConstraints,
  snapshots,
  utilizationMap,
  lastDatasetIds,
  rowCounts,
) {
  var staleDatasets = [];

  for (var i = 0; i < shortNames.length; i++) {
    var shortName = shortNames[i];
    var snapshot = snapshots[shortName] || null;
    var utilization = utilizationMap ? utilizationMap[shortName] : 1;
    var existingRowCount = rowCounts ? rowCounts[shortName] : undefined;

    var result = checkStaleness(
      shortName,
      currentConstraints,
      snapshot,
      utilization,
      lastDatasetIds,
      existingRowCount,
    );

    if (result.isStale) {
      staleDatasets.push({
        shortName: shortName,
        reason: result.reason,
      });
    }
  }

  return staleDatasets;
}

function hasAnyStaleDataset(
  shortNames,
  currentConstraints,
  snapshots,
  utilizationMap,
  lastDatasetIds,
  rowCounts,
) {
  for (var i = 0; i < shortNames.length; i++) {
    var shortName = shortNames[i];
    var snapshot = snapshots[shortName] || null;
    var utilization = utilizationMap ? utilizationMap[shortName] : 1;
    var existingRowCount = rowCounts ? rowCounts[shortName] : undefined;

    var result = checkStaleness(
      shortName,
      currentConstraints,
      snapshot,
      utilization,
      lastDatasetIds,
      existingRowCount,
    );

    if (result.isStale) {
      return true;
    }
  }

  return false;
}

export {
  isValidTemporalRange,
  isValidDepthRange,
  checkStaleness,
  getStaleDatasets,
  hasAnyStaleDataset,
};
