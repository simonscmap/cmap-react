import {
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
} from '../mapGeometryUtils';

describe('clampAndRound', () => {
  it('clamps and rounds to 1 decimal place', () => {
    expect(clampAndRound(45.67, -90, 90)).toBe(45.7);
    expect(clampAndRound(45.64, -90, 90)).toBe(45.6);
  });

  it('clamps to min', () => {
    expect(clampAndRound(-100, -90, 90)).toBe(-90);
  });

  it('clamps to max', () => {
    expect(clampAndRound(100, -90, 90)).toBe(90);
  });

  it('handles exact boundary values', () => {
    expect(clampAndRound(-90, -90, 90)).toBe(-90);
    expect(clampAndRound(90, -90, 90)).toBe(90);
    expect(clampAndRound(0, -90, 90)).toBe(0);
  });

  it('handles longitude range', () => {
    expect(clampAndRound(-200, -180, 180)).toBe(-180);
    expect(clampAndRound(200, -180, 180)).toBe(180);
    expect(clampAndRound(120.55, -180, 180)).toBe(120.6);
  });

  it('rounds .05 up (banker rounding not used)', () => {
    expect(clampAndRound(0.05, -90, 90)).toBe(0.1);
    expect(clampAndRound(-0.05, -90, 90)).toBe(-0);
  });

  it('handles negative values that need rounding', () => {
    expect(clampAndRound(-45.67, -90, 90)).toBe(-45.7);
    expect(clampAndRound(-45.64, -90, 90)).toBe(-45.6);
  });

  it('returns 0 for very small values', () => {
    expect(clampAndRound(0.001, -90, 90)).toBe(0);
    expect(clampAndRound(-0.001, -90, 90)).toBe(-0);
  });
});

describe('normalizeLon', () => {
  it('returns values within [-180, 180)', () => {
    expect(normalizeLon(0)).toBe(0);
    expect(normalizeLon(180)).toBe(-180);
    expect(normalizeLon(-180)).toBe(-180);
  });

  it('wraps values just past 180', () => {
    expect(normalizeLon(181)).toBe(-179);
    expect(normalizeLon(190)).toBe(-170);
  });

  it('wraps values just past -180', () => {
    expect(normalizeLon(-181)).toBe(179);
    expect(normalizeLon(-190)).toBe(170);
  });

  it('wraps full rotations', () => {
    expect(normalizeLon(360)).toBe(0);
    expect(normalizeLon(-360)).toBe(0);
    expect(normalizeLon(540)).toBe(-180);
    expect(normalizeLon(-540)).toBe(-180);
  });

  it('wraps multiple rotations', () => {
    expect(normalizeLon(721)).toBe(1);
    expect(normalizeLon(-721)).toBe(-1);
  });

  it('handles dateline crossing values', () => {
    expect(normalizeLon(179)).toBe(179);
    expect(normalizeLon(-179)).toBe(-179);
  });

  it('normalizes values near the dateline', () => {
    expect(normalizeLon(180.1)).toBeCloseTo(-179.9, 5);
    expect(normalizeLon(-180.1)).toBeCloseTo(179.9, 5);
  });

  it('handles fractional rotations', () => {
    expect(normalizeLon(270)).toBe(-90);
    expect(normalizeLon(-270)).toBe(90);
    expect(normalizeLon(450)).toBe(90);
  });
});

describe('constrainLonSpan', () => {
  it('returns null when span is within limit', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    expect(constrainLonSpan(extent, null)).toBeNull();
  });

  it('returns null at exactly MAX_LON_SPAN', () => {
    let extent = { xmin: -179.95, xmax: 179.95, ymin: -45, ymax: 45 };
    expect(constrainLonSpan(extent, null)).toBeNull();
  });

  it('constrains to -180/180 when no prevExtent', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -45, ymax: 45 };
    let result = constrainLonSpan(extent, null);
    expect(result.xmin).toBe(-180);
    expect(result.xmax).toBe(180);
    expect(result.ymin).toBe(-45);
    expect(result.ymax).toBe(45);
  });

  it('locks xmax when xmin moved more', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -300, xmax: 110, ymin: -45, ymax: 45 };
    let result = constrainLonSpan(extent, prevExtent);
    expect(result.xmin).toBe(110 - MAX_LON_SPAN);
    expect(result.xmax).toBe(110);
  });

  it('locks xmin when xmax moved more', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -110, xmax: 300, ymin: -45, ymax: 45 };
    let result = constrainLonSpan(extent, prevExtent);
    expect(result.xmin).toBe(-110);
    expect(result.xmax).toBe(-110 + MAX_LON_SPAN);
  });

  it('preserves y values', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -30, ymax: 60 };
    let result = constrainLonSpan(extent, null);
    expect(result.ymin).toBe(-30);
    expect(result.ymax).toBe(60);
  });

  it('favors locking xmin when both deltas are equal', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -300, xmax: 300, ymin: -45, ymax: 45 };
    let result = constrainLonSpan(extent, prevExtent);
    expect(result.xmin).toBe(-300);
    expect(result.xmax).toBe(-300 + MAX_LON_SPAN);
  });

  it('returns null when span is just under MAX_LON_SPAN', () => {
    let extent = { xmin: -179, xmax: 179, ymin: -45, ymax: 45 };
    expect(constrainLonSpan(extent, null)).toBeNull();
  });

  it('constrains when span is just over MAX_LON_SPAN', () => {
    let extent = { xmin: -180, xmax: 180, ymin: -45, ymax: 45 };
    let result = constrainLonSpan(extent, null);
    expect(result).not.toBeNull();
    expect(result.xmin).toBe(-180);
    expect(result.xmax).toBe(180);
  });

  it('handles asymmetric extents with prevExtent', () => {
    let prevExtent = { xmin: 50, xmax: 150 };
    let extent = { xmin: 40, xmax: 500, ymin: -10, ymax: 10 };
    let result = constrainLonSpan(extent, prevExtent);
    expect(result.xmin).toBe(40);
    expect(result.xmax).toBe(40 + MAX_LON_SPAN);
  });
});

describe('constrainLatBounds', () => {
  it('returns null when within bounds', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    expect(constrainLatBounds(extent)).toBeNull();
  });

  it('returns null at exact boundaries', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -90, ymax: 90 };
    expect(constrainLatBounds(extent)).toBeNull();
  });

  it('shifts down when ymax exceeds 90', () => {
    let extent = { xmin: -100, xmax: 100, ymin: 10, ymax: 100 };
    let result = constrainLatBounds(extent);
    expect(result.ymax).toBe(90);
    expect(result.ymin).toBe(0);
  });

  it('shifts up when ymin below -90', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: -10 };
    let result = constrainLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(0);
  });

  it('handles both bounds exceeded (shift preserves span)', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -50, ymax: 100 };
    let result = constrainLatBounds(extent);
    expect(result.ymax).toBe(90);
    expect(result.ymin).toBe(-60);
  });

  it('preserves x values', () => {
    let extent = { xmin: -120, xmax: 150, ymin: 80, ymax: 100 };
    let result = constrainLatBounds(extent);
    expect(result.xmin).toBe(-120);
    expect(result.xmax).toBe(150);
  });

  it('preserves span when shifted down from ymax', () => {
    let extent = { xmin: 0, xmax: 50, ymin: 70, ymax: 120 };
    let result = constrainLatBounds(extent);
    let originalSpan = 120 - 70;
    expect(result.ymax - result.ymin).toBe(originalSpan);
    expect(result.ymax).toBe(90);
    expect(result.ymin).toBe(40);
  });

  it('preserves span when shifted up from ymin', () => {
    let extent = { xmin: 0, xmax: 50, ymin: -120, ymax: -70 };
    let result = constrainLatBounds(extent);
    let originalSpan = -70 - (-120);
    expect(result.ymax - result.ymin).toBe(originalSpan);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(-40);
  });

  it('chain-shifts when ymax shift pushes ymin below -90', () => {
    let extent = { xmin: 0, xmax: 50, ymin: -85, ymax: 100 };
    let result = constrainLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(95);
  });

  it('handles zero-height extent at boundary', () => {
    let extent = { xmin: 0, xmax: 50, ymin: 91, ymax: 91 };
    let result = constrainLatBounds(extent);
    expect(result.ymax).toBe(90);
    expect(result.ymin).toBe(90);
  });
});

describe('clampLatBounds', () => {
  it('returns null when within bounds', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    expect(clampLatBounds(extent)).toBeNull();
  });

  it('returns null at exact boundaries', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -90, ymax: 90 };
    expect(clampLatBounds(extent)).toBeNull();
  });

  it('clamps ymin to -90', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 45 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(45);
  });

  it('clamps ymax to 90', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 100 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(-45);
    expect(result.ymax).toBe(90);
  });

  it('clamps both bounds', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 100 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(90);
  });

  it('preserves x values', () => {
    let extent = { xmin: -120, xmax: 150, ymin: -100, ymax: 100 };
    let result = clampLatBounds(extent);
    expect(result.xmin).toBe(-120);
    expect(result.xmax).toBe(150);
  });

  it('does not preserve span (clamps independently)', () => {
    let extent = { xmin: 0, xmax: 50, ymin: -100, ymax: 100 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(90);
    expect(result.ymax - result.ymin).toBe(180);
  });

  it('clamps only ymin when ymax is within bounds', () => {
    let extent = { xmin: 0, xmax: 50, ymin: -95, ymax: 0 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(-90);
    expect(result.ymax).toBe(0);
  });

  it('clamps only ymax when ymin is within bounds', () => {
    let extent = { xmin: 0, xmax: 50, ymin: 0, ymax: 95 };
    let result = clampLatBounds(extent);
    expect(result.ymin).toBe(0);
    expect(result.ymax).toBe(90);
  });
});

describe('MAX_LON_SPAN', () => {
  it('is 359.9', () => {
    expect(MAX_LON_SPAN).toBe(359.9);
  });
});

describe('applyExtentConstraints', () => {
  it('returns unchanged extent when no constraints needed', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.extent).toBe(extent);
    expect(result.changed).toBe(false);
  });

  it('constrains lon span with no prevExtent', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -45, ymax: 45 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-180);
    expect(result.extent.xmax).toBe(180);
  });

  it('clamps latitude when clampLat is true (create mode)', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 100 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.ymin).toBe(-90);
    expect(result.extent.ymax).toBe(90);
  });

  it('shifts latitude when clampLat is false (move mode)', () => {
    let extent = { xmin: -100, xmax: 100, ymin: 10, ymax: 100 };
    let result = applyExtentConstraints(extent, null, { clampLat: false });
    expect(result.changed).toBe(true);
    expect(result.extent.ymax).toBe(90);
    expect(result.extent.ymin).toBe(0);
  });

  it('applies both lon and lat constraints together', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -100, ymax: 100 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-180);
    expect(result.extent.xmax).toBe(180);
    expect(result.extent.ymin).toBe(-90);
    expect(result.extent.ymax).toBe(90);
  });

  it('uses prevExtent for lon constraint direction', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -300, xmax: 110, ymin: -45, ymax: 45 };
    let result = applyExtentConstraints(extent, prevExtent, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmax).toBe(110);
    expect(result.extent.xmin).toBe(110 - MAX_LON_SPAN);
  });

  it('defaults to clampLat false when options not provided', () => {
    let extent = { xmin: -100, xmax: 100, ymin: 10, ymax: 100 };
    let result = applyExtentConstraints(extent, null, {});
    expect(result.changed).toBe(true);
    expect(result.extent.ymax).toBe(90);
    expect(result.extent.ymin).toBe(0);
  });

  it('reports changed when only lon is constrained', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -45, ymax: 45 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.ymin).toBe(-45);
    expect(result.extent.ymax).toBe(45);
  });

  it('reports changed when only lat is constrained', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 45 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-100);
    expect(result.extent.xmax).toBe(100);
    expect(result.extent.ymin).toBe(-90);
    expect(result.extent.ymax).toBe(45);
  });

  it('returns same reference when nothing changes', () => {
    let extent = { xmin: -50, xmax: 50, ymin: -30, ymax: 30 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.extent).toBe(extent);
    expect(result.changed).toBe(false);
  });

  it('applies lat constraint to lon-constrained result', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -100, ymax: 50 };
    let result = applyExtentConstraints(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-180);
    expect(result.extent.xmax).toBe(180);
    expect(result.extent.ymin).toBe(-90);
    expect(result.extent.ymax).toBe(50);
  });

  it('shifts lat on lon-constrained result when clampLat is false', () => {
    let extent = { xmin: -200, xmax: 200, ymin: 50, ymax: 100 };
    let result = applyExtentConstraints(extent, null, { clampLat: false });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-180);
    expect(result.extent.xmax).toBe(180);
    expect(result.extent.ymax).toBe(90);
    expect(result.extent.ymin).toBe(40);
  });

  it('uses prevExtent to determine which lon edge to lock', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -110, xmax: 300, ymin: -45, ymax: 45 };
    let result = applyExtentConstraints(extent, prevExtent, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-110);
    expect(result.extent.xmax).toBe(-110 + MAX_LON_SPAN);
  });
});

describe('extractBoundsFromGeometry', () => {
  it('returns null for null geometry', () => {
    expect(extractBoundsFromGeometry(null)).toBeNull();
  });

  it('returns null for undefined geometry', () => {
    expect(extractBoundsFromGeometry(undefined)).toBeNull();
  });

  it('returns null when geometry has no extent', () => {
    expect(extractBoundsFromGeometry({})).toBeNull();
    expect(extractBoundsFromGeometry({ extent: null })).toBeNull();
  });

  it('extracts and rounds bounds from valid extent', () => {
    let geometry = { extent: { ymin: -45.67, ymax: 45.67, xmin: -100.12, xmax: 100.12 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.minLat).toBe(-45.7);
    expect(result.maxLat).toBe(45.7);
    expect(result.westLon).toBe(-100.1);
    expect(result.eastLon).toBe(100.1);
  });

  it('clamps latitude to [-90, 90]', () => {
    let geometry = { extent: { ymin: -100, ymax: 100, xmin: 0, xmax: 10 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.minLat).toBe(-90);
    expect(result.maxLat).toBe(90);
  });

  it('normalizes longitude beyond 180', () => {
    let geometry = { extent: { ymin: 0, ymax: 10, xmin: 200, xmax: 10 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.westLon).toBe(-160);
  });

  it('normalizes longitude beyond -180', () => {
    let geometry = { extent: { ymin: 0, ymax: 10, xmin: -200, xmax: 10 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.westLon).toBe(160);
  });

  it('handles exact boundary values', () => {
    let geometry = { extent: { ymin: -90, ymax: 90, xmin: -180, xmax: 180 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.minLat).toBe(-90);
    expect(result.maxLat).toBe(90);
    expect(result.westLon).toBe(-180);
    expect(result.eastLon).toBe(-180);
  });

  it('handles dateline-crossing extent', () => {
    let geometry = { extent: { ymin: 0, ymax: 10, xmin: 170, xmax: 190 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.westLon).toBe(170);
    expect(result.eastLon).toBe(-170);
  });

  it('handles zero-area extent (point geometry)', () => {
    let geometry = { extent: { ymin: 45, ymax: 45, xmin: -120, xmax: -120 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.minLat).toBe(45);
    expect(result.maxLat).toBe(45);
    expect(result.westLon).toBe(-120);
    expect(result.eastLon).toBe(-120);
  });

  it('handles very large extents', () => {
    let geometry = { extent: { ymin: -500, ymax: 500, xmin: -500, xmax: 500 } };
    let result = extractBoundsFromGeometry(geometry);
    expect(result.minLat).toBe(-90);
    expect(result.maxLat).toBe(90);
    expect(result.westLon).toBe(-140);
    expect(result.eastLon).toBe(140);
  });
});

describe('normalizeBoundsForPolygon', () => {
  it('orders lat correctly when lat1 < lat2', () => {
    let result = normalizeBoundsForPolygon(10, 20, -50, 50);
    expect(result.minLat).toBe(10);
    expect(result.maxLat).toBe(20);
  });

  it('orders lat correctly when lat1 > lat2', () => {
    let result = normalizeBoundsForPolygon(20, 10, -50, 50);
    expect(result.minLat).toBe(10);
    expect(result.maxLat).toBe(20);
  });

  it('handles equal latitudes', () => {
    let result = normalizeBoundsForPolygon(15, 15, -50, 50);
    expect(result.minLat).toBe(15);
    expect(result.maxLat).toBe(15);
  });

  it('preserves lon order when lon1 < lon2', () => {
    let result = normalizeBoundsForPolygon(10, 20, -50, 50);
    expect(result.minLon).toBe(-50);
    expect(result.maxLon).toBe(50);
  });

  it('adds 360 to maxLon when minLon > maxLon (dateline crossing)', () => {
    let result = normalizeBoundsForPolygon(10, 20, 170, -170);
    expect(result.minLon).toBe(170);
    expect(result.maxLon).toBe(190);
  });

  it('does not add 360 when lons are equal', () => {
    let result = normalizeBoundsForPolygon(10, 20, 50, 50);
    expect(result.minLon).toBe(50);
    expect(result.maxLon).toBe(50);
  });

  it('handles full world extent', () => {
    let result = normalizeBoundsForPolygon(-90, 90, -180, 180);
    expect(result.minLat).toBe(-90);
    expect(result.maxLat).toBe(90);
    expect(result.minLon).toBe(-180);
    expect(result.maxLon).toBe(180);
  });

  it('handles negative latitudes in southern hemisphere', () => {
    let result = normalizeBoundsForPolygon(-60, -30, 10, 20);
    expect(result.minLat).toBe(-60);
    expect(result.maxLat).toBe(-30);
  });

  it('handles zero-width at prime meridian', () => {
    let result = normalizeBoundsForPolygon(10, 20, 0, 0);
    expect(result.minLon).toBe(0);
    expect(result.maxLon).toBe(0);
  });

  it('handles large positive lon1 with negative lon2', () => {
    let result = normalizeBoundsForPolygon(0, 10, 150, -150);
    expect(result.minLon).toBe(150);
    expect(result.maxLon).toBe(210);
  });
});

describe('extentToRings', () => {
  it('returns correct ring structure from standard extent', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    let rings = extentToRings(extent);
    expect(rings).toEqual([[
      [-100, -45], [100, -45], [100, 45], [-100, 45], [-100, -45],
    ]]);
  });

  it('ring has 5 points (closed polygon)', () => {
    let extent = { xmin: 0, xmax: 10, ymin: 0, ymax: 10 };
    let rings = extentToRings(extent);
    expect(rings[0]).toHaveLength(5);
  });

  it('first and last points are identical', () => {
    let extent = { xmin: -50, xmax: 50, ymin: -25, ymax: 25 };
    let rings = extentToRings(extent);
    expect(rings[0][0]).toEqual(rings[0][4]);
  });

  it('handles negative coordinates', () => {
    let extent = { xmin: -180, xmax: -90, ymin: -90, ymax: -45 };
    let rings = extentToRings(extent);
    expect(rings).toEqual([[
      [-180, -90], [-90, -90], [-90, -45], [-180, -45], [-180, -90],
    ]]);
  });

  it('handles dateline-spanning extent with maxLon > 180', () => {
    let extent = { xmin: 170, xmax: 190, ymin: -10, ymax: 10 };
    let rings = extentToRings(extent);
    expect(rings[0][0]).toEqual([170, -10]);
    expect(rings[0][1]).toEqual([190, -10]);
  });
});

describe('constrainAndSnapshot', () => {
  it('returns unchanged extent with changed false when no constraint needed', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -45, ymax: 45 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.changed).toBe(false);
    expect(result.extent).toBe(extent);
  });

  it('returns constrained extent when lon span exceeded', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -45, ymax: 45 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmin).toBe(-180);
    expect(result.extent.xmax).toBe(180);
  });

  it('returns constrained extent when lat exceeded', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 45 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.ymin).toBe(-90);
  });

  it('snapshot is a plain object with correct values', () => {
    let extent = { xmin: -50, xmax: 50, ymin: -30, ymax: 30 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.snapshot).toEqual({ xmin: -50, xmax: 50, ymin: -30, ymax: 30 });
  });

  it('snapshot is not the same reference as extent', () => {
    let extent = { xmin: -50, xmax: 50, ymin: -30, ymax: 30 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.snapshot).not.toBe(result.extent);
  });

  it('works with clampLat true (create mode)', () => {
    let extent = { xmin: -100, xmax: 100, ymin: -100, ymax: 100 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.extent.ymin).toBe(-90);
    expect(result.extent.ymax).toBe(90);
  });

  it('works with clampLat false (move mode)', () => {
    let extent = { xmin: -100, xmax: 100, ymin: 50, ymax: 100 };
    let result = constrainAndSnapshot(extent, null, { clampLat: false });
    expect(result.extent.ymax).toBe(90);
    expect(result.extent.ymin).toBe(40);
  });

  it('passes prevExtent through to lon constraint', () => {
    let prevExtent = { xmin: -100, xmax: 100 };
    let extent = { xmin: -300, xmax: 110, ymin: -45, ymax: 45 };
    let result = constrainAndSnapshot(extent, prevExtent, { clampLat: true });
    expect(result.changed).toBe(true);
    expect(result.extent.xmax).toBe(110);
    expect(result.snapshot.xmax).toBe(110);
  });

  it('snapshot reflects constrained values not original', () => {
    let extent = { xmin: -200, xmax: 200, ymin: -100, ymax: 100 };
    let result = constrainAndSnapshot(extent, null, { clampLat: true });
    expect(result.snapshot.xmin).toBe(-180);
    expect(result.snapshot.xmax).toBe(180);
    expect(result.snapshot.ymin).toBe(-90);
    expect(result.snapshot.ymax).toBe(90);
  });
});

describe('isNearMinZoom', () => {
  it('returns true when scale equals threshold', () => {
    expect(isNearMinZoom(1000, 1000)).toBe(true);
  });

  it('returns true when scale exceeds threshold', () => {
    expect(isNearMinZoom(1100, 1000)).toBe(true);
  });

  it('returns true at exactly 95% of threshold', () => {
    expect(isNearMinZoom(950, 1000)).toBe(true);
  });

  it('returns true just above 95%', () => {
    expect(isNearMinZoom(960, 1000)).toBe(true);
  });

  it('returns false just below 95%', () => {
    expect(isNearMinZoom(949, 1000)).toBe(false);
  });

  it('returns false when zoomed in significantly', () => {
    expect(isNearMinZoom(500, 1000)).toBe(false);
  });
});

describe('computeZoomOutScale', () => {
  it('doubles scale when result is under max', () => {
    expect(computeZoomOutScale(100, 500)).toBe(200);
  });

  it('caps at maxScale when doubling would exceed', () => {
    expect(computeZoomOutScale(300, 500)).toBe(500);
  });

  it('returns maxScale when already at max', () => {
    expect(computeZoomOutScale(500, 500)).toBe(500);
  });

  it('returns maxScale when already exceeding max', () => {
    expect(computeZoomOutScale(600, 500)).toBe(500);
  });

  it('handles small scales', () => {
    expect(computeZoomOutScale(1, 1000)).toBe(2);
  });
});

describe('shouldBlockZoomOut', () => {
  it('returns true when scrolling out at min zoom', () => {
    expect(shouldBlockZoomOut(100, 1000, 1000)).toBe(true);
  });

  it('returns true when scrolling out above min zoom', () => {
    expect(shouldBlockZoomOut(100, 1100, 1000)).toBe(true);
  });

  it('returns false when scrolling in at min zoom', () => {
    expect(shouldBlockZoomOut(-100, 1000, 1000)).toBe(false);
  });

  it('returns false when scrolling out below min zoom', () => {
    expect(shouldBlockZoomOut(100, 500, 1000)).toBe(false);
  });

  it('returns false when deltaY is 0', () => {
    expect(shouldBlockZoomOut(0, 1000, 1000)).toBe(false);
  });

  it('returns false when scrolling in below min zoom', () => {
    expect(shouldBlockZoomOut(-100, 500, 1000)).toBe(false);
  });
});
