import {
  MAX_LON_SPAN,
  clampAndRound,
  normalizeLon,
  constrainLonSpan,
  constrainLatBounds,
  clampLatBounds,
  applyExtentConstraints,
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
});
