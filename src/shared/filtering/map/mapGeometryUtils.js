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

export {
  MAX_LON_SPAN,
  clampAndRound,
  normalizeLon,
  constrainLonSpan,
  constrainLatBounds,
  clampLatBounds,
};
