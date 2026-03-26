let MAX_LON_SPAN = 359.9;

function clampAndRound(value, min, max) {
  return Math.round(Math.max(min, Math.min(max, value)) * 10) / 10;
}

function normalizeLon(lon) {
  return ((lon % 360) + 540) % 360 - 180;
}

function constrainLonSpan(extent, prevExtent) {
  let lonSpan = extent.xmax - extent.xmin;
  if (lonSpan <= MAX_LON_SPAN) {
    return null;
  }

  let xmin = extent.xmin;
  let xmax = extent.xmax;

  if (prevExtent) {
    let xminDelta = Math.abs(xmin - prevExtent.xmin);
    let xmaxDelta = Math.abs(xmax - prevExtent.xmax);
    if (xminDelta > xmaxDelta) {
      xmin = xmax - MAX_LON_SPAN;
    } else {
      xmax = xmin + MAX_LON_SPAN;
    }
  } else {
    xmin = -180;
    xmax = 180;
  }

  return { xmin: xmin, xmax: xmax, ymin: extent.ymin, ymax: extent.ymax };
}

function constrainLatBounds(extent) {
  let ymin = extent.ymin;
  let ymax = extent.ymax;

  if (ymax > 90) {
    let shift = ymax - 90;
    ymax = 90;
    ymin = ymin - shift;
  }
  if (ymin < -90) {
    let shift = -90 - ymin;
    ymin = -90;
    ymax = ymax + shift;
  }

  if (ymin === extent.ymin && ymax === extent.ymax) {
    return null;
  }

  return { xmin: extent.xmin, xmax: extent.xmax, ymin: ymin, ymax: ymax };
}

function clampLatBounds(extent) {
  let ymin = Math.max(-90, extent.ymin);
  let ymax = Math.min(90, extent.ymax);
  if (ymin === extent.ymin && ymax === extent.ymax) {
    return null;
  }
  return { xmin: extent.xmin, xmax: extent.xmax, ymin: ymin, ymax: ymax };
}

function applyExtentConstraints(extent, prevExtent, options) {
  let clampLat = options && options.clampLat;
  let result = constrainLonSpan(extent, prevExtent) || extent;
  result = clampLat ? (clampLatBounds(result) || result) : (constrainLatBounds(result) || result);
  let changed = result !== extent;
  return { extent: result, changed: changed };
}

function extractBoundsFromGeometry(geometry) {
  if (!geometry) return null;
  let extent = geometry.extent;
  if (!extent) return null;
  return {
    minLat: clampAndRound(extent.ymin, -90, 90),
    maxLat: clampAndRound(extent.ymax, -90, 90),
    westLon: clampAndRound(normalizeLon(extent.xmin), -180, 180),
    eastLon: clampAndRound(normalizeLon(extent.xmax), -180, 180),
  };
}

function normalizeBoundsForPolygon(lat1, lat2, lon1, lon2) {
  let minLat = Math.min(lat1, lat2);
  let maxLat = Math.max(lat1, lat2);
  let minLon = lon1;
  let maxLon = lon2;
  if (minLon > maxLon) {
    maxLon = maxLon + 360;
  }
  return { minLat: minLat, maxLat: maxLat, minLon: minLon, maxLon: maxLon };
}

function extentToRings(extent) {
  return [[
    [extent.xmin, extent.ymin], [extent.xmax, extent.ymin],
    [extent.xmax, extent.ymax], [extent.xmin, extent.ymax],
    [extent.xmin, extent.ymin],
  ]];
}

function constrainAndSnapshot(extent, prevExtent, options) {
  let constrained = applyExtentConstraints(extent, prevExtent, options);
  let snapshot = {
    xmin: constrained.extent.xmin,
    xmax: constrained.extent.xmax,
    ymin: constrained.extent.ymin,
    ymax: constrained.extent.ymax,
  };
  return { extent: constrained.extent, changed: constrained.changed, snapshot: snapshot };
}

function isNearMinZoom(scale, minZoomThreshold) {
  return scale >= minZoomThreshold * 0.95;
}

function computeZoomOutScale(currentScale, maxScale) {
  return Math.min(currentScale * 2, maxScale);
}

function shouldBlockZoomOut(deltaY, currentScale, minZoomThreshold) {
  return deltaY > 0 && currentScale >= minZoomThreshold;
}

export {
  MAX_LON_SPAN,
  clampAndRound,
  normalizeLon,
  constrainLonSpan,
  constrainLatBounds,
  clampLatBounds,
  applyExtentConstraints,
  extractBoundsFromGeometry,
  normalizeBoundsForPolygon,
  extentToRings,
  constrainAndSnapshot,
  isNearMinZoom,
  computeZoomOutScale,
  shouldBlockZoomOut,
};
