function roundTo4Decimals(value) {
  if (value === null || value === undefined) {
    return value;
  }
  return Math.round(value * 10000) / 10000;
}

function spatialBoundsEqual(a, b) {
  if (!a || !b) {
    return a === b;
  }

  return (
    roundTo4Decimals(a.latMin) === roundTo4Decimals(b.latMin) &&
    roundTo4Decimals(a.latMax) === roundTo4Decimals(b.latMax) &&
    roundTo4Decimals(a.lonMin) === roundTo4Decimals(b.lonMin) &&
    roundTo4Decimals(a.lonMax) === roundTo4Decimals(b.lonMax)
  );
}

function temporalRangeEqual(a, b) {
  if (!a || !b) {
    return a === b;
  }

  var aMinTime = a.timeMin ? new Date(a.timeMin).getTime() : null;
  var aMaxTime = a.timeMax ? new Date(a.timeMax).getTime() : null;
  var bMinTime = b.timeMin ? new Date(b.timeMin).getTime() : null;
  var bMaxTime = b.timeMax ? new Date(b.timeMax).getTime() : null;

  return aMinTime === bMinTime && aMaxTime === bMaxTime;
}

function depthRangeEqual(a, b) {
  if (!a || !b) {
    return a === b;
  }

  return a.depthMin === b.depthMin && a.depthMax === b.depthMax;
}

function areConstraintsEqual(current, snapshot) {
  if (!current || !snapshot) {
    return false;
  }

  if (current.temporalEnabled !== snapshot.temporalEnabled) {
    return false;
  }

  if (current.depthEnabled !== snapshot.depthEnabled) {
    return false;
  }

  if (
    current.includePartialOverlaps !== undefined &&
    snapshot.includePartialOverlaps !== undefined &&
    current.includePartialOverlaps !== snapshot.includePartialOverlaps
  ) {
    return false;
  }

  if (!spatialBoundsEqual(current.spatialBounds, snapshot.spatialBounds)) {
    return false;
  }

  if (current.temporalEnabled && snapshot.temporalEnabled) {
    if (!temporalRangeEqual(current.temporalRange, snapshot.temporalRange)) {
      return false;
    }
  }

  if (current.depthEnabled && snapshot.depthEnabled) {
    if (!depthRangeEqual(current.depthRange, snapshot.depthRange)) {
      return false;
    }
  }

  return true;
}

export {
  roundTo4Decimals,
  spatialBoundsEqual,
  temporalRangeEqual,
  depthRangeEqual,
  areConstraintsEqual,
};
