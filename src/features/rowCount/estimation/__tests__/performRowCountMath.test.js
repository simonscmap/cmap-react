import performRowCountMath, {
  clampSpatialBounds,
  clampTemporalRange,
  clampDepthRange,
  countSpatialDataPoints,
  calculateMonthlyCount,
} from '../performRowCountMath';

let utcDate = (year, month, day) => {
  return new Date(Date.UTC(year, month - 1, day));
};

let makeResolvedInputs = (overrides) => {
  let base = {
    spatialBounds: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
    temporalBounds: { timeMin: '2020-01-01T00:00:00Z', timeMax: '2020-12-31T00:00:00Z' },
    depthBounds: { depthMin: null, depthMax: null },
    resolutions: { spatialDegrees: 1, temporalDays: 1, isMonthlyClimatology: false },
    hasDepth: false,
    tableCount: 1,
    depthCountInRange: 0,
  };
  let result = Object.assign({}, base, overrides);
  if (overrides && overrides.spatialBounds) {
    result.spatialBounds = Object.assign({}, base.spatialBounds, overrides.spatialBounds);
  }
  if (overrides && overrides.temporalBounds) {
    result.temporalBounds = Object.assign({}, base.temporalBounds, overrides.temporalBounds);
  }
  if (overrides && overrides.depthBounds) {
    result.depthBounds = Object.assign({}, base.depthBounds, overrides.depthBounds);
  }
  if (overrides && overrides.resolutions) {
    result.resolutions = Object.assign({}, base.resolutions, overrides.resolutions);
  }
  return result;
};

let makeConstraints = (overrides) => {
  let base = {
    spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
    temporalEnabled: false,
    temporalRange: { timeMin: null, timeMax: null },
    depthEnabled: false,
    depthRange: { depthMin: null, depthMax: null },
  };
  let result = Object.assign({}, base, overrides);
  if (overrides && overrides.spatialBounds) {
    result.spatialBounds = Object.assign({}, base.spatialBounds, overrides.spatialBounds);
  }
  if (overrides && overrides.temporalRange) {
    result.temporalRange = Object.assign({}, base.temporalRange, overrides.temporalRange);
  }
  if (overrides && overrides.depthRange) {
    result.depthRange = Object.assign({}, base.depthRange, overrides.depthRange);
  }
  return result;
};

let singlePointDataset = (overrides) => {
  return makeResolvedInputs(Object.assign({
    spatialBounds: { latMin: 0, latMax: 0, lonMin: 0, lonMax: 1 },
  }, overrides));
};

let singlePointConstraints = (overrides) => {
  return makeConstraints(Object.assign({
    spatialBounds: { latMin: 0, latMax: 0, lonMin: 0, lonMax: 0.5 },
  }, overrides));
};

// ============================================================
// Shared helpers — identical in both implementations
// ============================================================

describe('clampSpatialBounds', () => {
  it('returns null when latitude ranges do not overlap', () => {
    let result = clampSpatialBounds(
      { latMin: 50, latMax: 60, lonMin: 0, lonMax: 10 },
      { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
    );
    expect(result).toBeNull();
  });

  it('returns null when longitude ranges do not overlap', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: 100, lonMax: 110 },
      { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
    );
    expect(result).toBeNull();
  });

  it('clamps latitude to dataset bounds', () => {
    let result = clampSpatialBounds(
      { latMin: -10, latMax: 50, lonMin: 0, lonMax: 10 },
      { latMin: 0, latMax: 30, lonMin: 0, lonMax: 10 },
    );
    expect(result.latMin).toBe(0);
    expect(result.latMax).toBe(30);
  });

  it('clamps longitude to dataset bounds (normal case)', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: -20, lonMax: 50 },
      { latMin: 0, latMax: 10, lonMin: 0, lonMax: 30 },
    );
    expect(result.lonMin).toBe(0);
    expect(result.lonMax).toBe(30);
  });

  it('handles dateline-crossing query overlapping both segments', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: 170, lonMax: -170 },
      { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
    );
    expect(result).not.toBeNull();
    expect(result.lonMin).toBe(170);
    expect(result.lonMax).toBe(-170);
  });

  it('handles dateline-crossing query overlapping east segment only', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: 170, lonMax: -170 },
      { latMin: 0, latMax: 10, lonMin: 160, lonMax: 175 },
    );
    expect(result).not.toBeNull();
    expect(result.lonMin).toBe(170);
    expect(result.lonMax).toBe(175);
  });

  it('handles dateline-crossing query overlapping west segment only', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: 170, lonMax: -170 },
      { latMin: 0, latMax: 10, lonMin: -175, lonMax: -160 },
    );
    expect(result).not.toBeNull();
    expect(result.lonMin).toBe(-175);
    expect(result.lonMax).toBe(-170);
  });

  it('clamps correctly when both query and dataset cross the dateline', () => {
    let result = clampSpatialBounds(
      { latMin: 0, latMax: 10, lonMin: 170, lonMax: -170 },
      { latMin: -90, latMax: 90, lonMin: 160, lonMax: -160 },
    );
    expect(result).not.toBeNull();
    expect(result.lonMin).toBe(170);
    expect(result.lonMax).toBe(-170);
  });

  it('returns exact bounds when query is inside dataset', () => {
    let result = clampSpatialBounds(
      { latMin: 5, latMax: 8, lonMin: 5, lonMax: 8 },
      { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
    );
    expect(result.latMin).toBe(5);
    expect(result.latMax).toBe(8);
    expect(result.lonMin).toBe(5);
    expect(result.lonMax).toBe(8);
  });
});

describe('clampTemporalRange', () => {
  it('returns null when query is entirely before dataset', () => {
    let result = clampTemporalRange(
      { timeMin: '2018-01-01T00:00:00Z', timeMax: '2018-12-31T00:00:00Z' },
      { timeMin: '2020-01-01T00:00:00Z', timeMax: '2022-12-31T00:00:00Z' },
    );
    expect(result).toBeNull();
  });

  it('returns null when query is entirely after dataset', () => {
    let result = clampTemporalRange(
      { timeMin: '2023-01-01T00:00:00Z', timeMax: '2023-12-31T00:00:00Z' },
      { timeMin: '2020-01-01T00:00:00Z', timeMax: '2022-12-31T00:00:00Z' },
    );
    expect(result).toBeNull();
  });

  it('clamps to intersection when ranges overlap', () => {
    let result = clampTemporalRange(
      { timeMin: '2019-01-01T00:00:00Z', timeMax: '2021-06-01T00:00:00Z' },
      { timeMin: '2020-01-01T00:00:00Z', timeMax: '2022-12-31T00:00:00Z' },
    );
    expect(result.timeMin.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    expect(result.timeMax.toISOString()).toBe('2021-06-01T00:00:00.000Z');
  });

  it('returns query range when fully inside dataset', () => {
    let result = clampTemporalRange(
      { timeMin: '2021-03-01T00:00:00Z', timeMax: '2021-09-01T00:00:00Z' },
      { timeMin: '2020-01-01T00:00:00Z', timeMax: '2022-12-31T00:00:00Z' },
    );
    expect(result.timeMin.toISOString()).toBe('2021-03-01T00:00:00.000Z');
    expect(result.timeMax.toISOString()).toBe('2021-09-01T00:00:00.000Z');
  });
});

describe('clampDepthRange', () => {
  it('returns null when query is entirely below dataset', () => {
    let result = clampDepthRange(
      { depthMin: 500, depthMax: 1000 },
      { depthMin: 0, depthMax: 100 },
    );
    expect(result).toBeNull();
  });

  it('returns null when query is entirely above dataset', () => {
    let result = clampDepthRange(
      { depthMin: 0, depthMax: 5 },
      { depthMin: 10, depthMax: 100 },
    );
    expect(result).toBeNull();
  });

  it('clamps to intersection when ranges overlap', () => {
    let result = clampDepthRange(
      { depthMin: 0, depthMax: 200 },
      { depthMin: 50, depthMax: 150 },
    );
    expect(result.depthMin).toBe(50);
    expect(result.depthMax).toBe(150);
  });

  it('returns query range when fully inside dataset', () => {
    let result = clampDepthRange(
      { depthMin: 20, depthMax: 80 },
      { depthMin: 0, depthMax: 100 },
    );
    expect(result.depthMin).toBe(20);
    expect(result.depthMax).toBe(80);
  });
});

describe('countSpatialDataPoints', () => {
  it('counts aligned grid points (0-10, res=1, origin=0)', () => {
    expect(countSpatialDataPoints(0, 10, 0, 1)).toBe(11);
  });

  it('counts offset grid points (0.5-9.5, res=1, origin=0)', () => {
    expect(countSpatialDataPoints(0.5, 9.5, 0, 1)).toBe(9);
  });

  it('returns 1 when range is smaller than resolution', () => {
    expect(countSpatialDataPoints(0, 0.5, 0, 1)).toBe(1);
  });

  it('handles fractional resolution (0-1, res=0.25, origin=0)', () => {
    expect(countSpatialDataPoints(0, 1, 0, 0.25)).toBe(5);
  });

  it('handles negative coordinates (-10 to 0, res=1, origin=-90)', () => {
    expect(countSpatialDataPoints(-10, 0, -90, 1)).toBe(11);
  });
});

describe('calculateMonthlyCount', () => {
  it('returns 1 for same month', () => {
    expect(calculateMonthlyCount(utcDate(2025, 1, 1), utcDate(2025, 1, 31))).toBe(1);
  });

  it('returns 12 for full year (Jan to Dec)', () => {
    expect(calculateMonthlyCount(utcDate(2025, 1, 1), utcDate(2025, 12, 1))).toBe(12);
  });

  it('counts months across year boundary (Nov 2020 to Feb 2021)', () => {
    expect(calculateMonthlyCount(utcDate(2020, 11, 1), utcDate(2021, 2, 1))).toBe(4);
  });
});

// ============================================================
// Integration tests — test through the orchestrator
//
// These use singlePointDataset/singlePointConstraints to collapse
// the spatial dimension to 1x1, so the result equals:
//   dateCount * depthCount * tableCount
// This isolates the dimension under test without calling internal helpers.
// ============================================================

describe('performRowCountMath', () => {

  // --- spatial counting ---

  describe('spatial counting', () => {
    it('counts grid points for a 10x10 box at 1-degree resolution', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
        }),
      );
      expect(result).toBe(11 * 11);
    });

    it('counts grid points at 0.25-degree resolution', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 1, lonMin: 0, lonMax: 1 },
          resolutions: { spatialDegrees: 0.25, temporalDays: 1, isMonthlyClimatology: false },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 1, lonMin: 0, lonMax: 1 },
        }),
      );
      expect(result).toBe(5 * 5);
    });

    it('handles dateline-crossing query', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 170, lonMax: -170 },
        }),
      );
      expect(result).toBeGreaterThan(1);
    });

    it('treats lonMin === lonMax as a single meridian, not dateline crossing', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 50, lonMax: 50 },
        }),
      );
      expect(result).toBe(11 * 1);
    });

    it('returns 0 when spatial bounds do not overlap', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 50, latMax: 60, lonMin: 50, lonMax: 60 },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
        }),
      );
      expect(result).toBe(0);
    });

    it('clamps query to dataset coverage', () => {
      let wide = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 5, lonMin: 0, lonMax: 5 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: -10, latMax: 20, lonMin: -10, lonMax: 20 },
        }),
      );
      let exact = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 5, lonMin: 0, lonMax: 5 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 5, lonMin: 0, lonMax: 5 },
        }),
      );
      expect(wide).toBe(exact);
    });

    it('counts a single parallel (latMin === latMax) as 1 lat point', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 45, latMax: 45, lonMin: 0, lonMax: 10 },
        }),
      );
      expect(result).toBe(1 * 11);
    });

    it('counts global latitude coverage (-90 to 90) at 1-degree resolution', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: -90, latMax: 90, lonMin: 0, lonMax: 0 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: -90, latMax: 90, lonMin: 0, lonMax: 0 },
        }),
      );
      expect(result).toBe(181 * 1);
    });

    it('counts full globe longitude (-180 to 180) at 1-degree resolution', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: 180 },
        }),
      );
      expect(result).toBe(1 * 361);
    });

    it('handles zero-area query (single point: latMin===latMax and lonMin===lonMax)', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 5, lonMax: 5 },
        }),
      );
      expect(result).toBe(1);
    });

    it('handles query at exactly longitude 180', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 180, lonMax: 180 },
        }),
      );
      expect(result).toBe(1);
    });

    it('handles query at exactly longitude -180', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: -180 },
        }),
      );
      expect(result).toBe(1);
    });

    it('handles dateline-crossing query with dataset that only covers eastern hemisphere', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 100, lonMax: 179 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 170, lonMax: -170 },
        }),
      );
      expect(result).toBe(10);
    });

    it('handles dateline-crossing query with dataset that only covers western hemisphere', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: -179, lonMax: -100 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 170, lonMax: -170 },
        }),
      );
      expect(result).toBe(10);
    });

    it('returns 0 for dateline-crossing query when dataset does not overlap either segment', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 50 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 170, lonMax: -170 },
        }),
      );
      expect(result).toBe(0);
    });

    it('handles query exactly matching dataset bounds', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 10, latMax: 20, lonMin: 30, lonMax: 40 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 10, latMax: 20, lonMin: 30, lonMax: 40 },
        }),
      );
      expect(result).toBe(11 * 11);
    });

    it('handles near-dateline query that does not cross (lonMin=170, lonMax=179)', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 170, lonMax: 179 },
        }),
      );
      expect(result).toBe(10);
    });

    it('handles near-dateline query that does not cross (lonMin=-179, lonMax=-170)', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -179, lonMax: -170 },
        }),
      );
      expect(result).toBe(10);
    });

    it('handles dateline-crossing query spanning nearly the full globe', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: -180, lonMax: 180 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 0, lonMin: 1, lonMax: -1 },
        }),
      );
      expect(result).toBeGreaterThan(300);
    });

    it('handles single-point dataset bounds with matching single-point query', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 10, lonMax: 10 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 10, lonMax: 10 },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 0 when single-point query misses single-point dataset in latitude', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 10, lonMax: 10 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 6, latMax: 6, lonMin: 10, lonMax: 10 },
        }),
      );
      expect(result).toBe(0);
    });

    it('returns 0 when single-point query misses single-point dataset in longitude', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 10, lonMax: 10 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 11, lonMax: 11 },
        }),
      );
      expect(result).toBe(0);
    });

    it('handles fractional resolution with single parallel query', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
          resolutions: { spatialDegrees: 0.25, temporalDays: 1, isMonthlyClimatology: false },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 5, latMax: 5, lonMin: 0, lonMax: 1 },
        }),
      );
      expect(result).toBe(1 * 5);
    });

    it('produces same result when query extends beyond dataset on all sides', () => {
      let bounded = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 10, latMax: 20, lonMin: 10, lonMax: 20 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: 10, latMax: 20, lonMin: 10, lonMax: 20 },
        }),
      );
      let overextended = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 10, latMax: 20, lonMin: 10, lonMax: 20 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        makeConstraints({
          spatialBounds: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
        }),
      );
      expect(overextended).toBe(bounded);
    });
  });

  // --- temporal counting: daily ---

  describe('temporal counting — daily resolution', () => {
    it('counts 10 days for a 10-day range', () => {
      let result = performRowCountMath(
        singlePointDataset(),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-10T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(10);
    });

    it('returns at least 1 for same-day range', () => {
      let result = performRowCountMath(
        singlePointDataset(),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });
  });

  // --- temporal counting: weekly (7-day) ---

  describe('temporal counting — weekly resolution', () => {
    it('counts 5 weekly points for a 28-day range', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-29T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(5);
    });

    it('returns 1 when range is shorter than 7 days', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-03T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });
  });

  // --- temporal counting: 8-day ---

  describe('temporal counting — 8-day resolution', () => {
    it('counts 5 points for a 32-day range', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 8, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-02-02T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(5);
    });
  });

  // --- temporal counting: 3-day ---

  describe('temporal counting — 3-day resolution', () => {
    it('counts 4 points for a 9-day range', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 3, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-10T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(4);
    });
  });

  // --- temporal counting: monthly (30-day) ---

  describe('temporal counting — monthly resolution', () => {
    it('counts 6 months for Jan to Jun', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 30, isMonthlyClimatology: false },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-06-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(6);
    });

    it('counts 4 months across year boundary (Nov to Feb)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 30, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2019-01-01T00:00:00Z',
            timeMax: '2021-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-11-01T00:00:00Z',
            timeMax: '2021-02-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(4);
    });
  });

  // --- temporal counting: monthly climatology ---

  describe('temporal counting — monthly climatology', () => {
    it('returns 12 for unconstrained climatology', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(12);
    });

    it('returns 12 for full-year constrained climatology (Jan to Dec)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(12);
    });

    it('returns 6 for forward range (Mar to Aug)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-03-01T00:00:00Z',
            timeMax: '2025-08-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(6);
    });

    it('returns 4 for wrap range (Nov to Feb)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2026-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-11-01T00:00:00Z',
            timeMax: '2026-02-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(4);
    });

    it('returns 1 for single month (Jan)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-01-31T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 2 for Dec to Jan (cross-year)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2026-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-12-01T00:00:00Z',
            timeMax: '2026-01-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(2);
    });

    it('caps at 12 when span exceeds one year', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-10-10T00:00:00Z',
            timeMax: '2022-12-16T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(12);
    });

    it('returns 11 for Jan to Nov (just under full year)', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-11-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(11);
    });
  });

  // --- temporal: unconstrained behavior ---

  describe('temporal — unconstrained behavior', () => {
    it('uses full dataset temporal range when constraints disabled', () => {
      let result = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-10T00:00:00Z',
          },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(10);
    });

    it('returns 1 when no temporal bounds and constraints disabled', () => {
      let result = performRowCountMath(
        singlePointDataset({
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(1);
    });
  });

  // --- temporal clamping ---

  describe('temporal clamping', () => {
    it('returns 0 when temporal bounds do not overlap', () => {
      let result = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2018-01-01T00:00:00Z',
            timeMax: '2018-12-31T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(0);
    });

    it('clamps temporal query to dataset coverage', () => {
      let wide = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
      );
      let exact = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
      );
      expect(wide).toBe(exact);
    });
  });

  // --- temporal counting: single instant ---

  describe('temporal counting — single instant (timeMin === timeMax)', () => {
    it('returns 1 for daily resolution', () => {
      let result = performRowCountMath(
        singlePointDataset(),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-06-15T00:00:00Z',
            timeMax: '2020-06-15T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 1 for weekly resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-03-15T00:00:00Z',
            timeMax: '2020-03-15T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 1 for 8-day resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 8, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-04-10T00:00:00Z',
            timeMax: '2020-04-10T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 1 for 3-day resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 3, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-02-20T00:00:00Z',
            timeMax: '2020-02-20T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });

    it('returns 1 for monthly resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 30, isMonthlyClimatology: false },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-07-01T00:00:00Z',
            timeMax: '2020-07-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(1);
    });
  });

  // --- temporal counting: exact one resolution period ---

  describe('temporal counting — range exactly one resolution period', () => {
    it('returns 2 for exactly 7 days at weekly resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-08T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(2);
    });

    it('returns 2 for exactly 8 days at 8-day resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 8, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-09T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(2);
    });

    it('returns 2 for exactly 3 days at 3-day resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 3, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-04T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(2);
    });
  });

  // --- temporal counting: unaligned anchored ---

  describe('temporal counting — anchored counting with unaligned query start', () => {
    it('counts correctly when query starts between 7-day anchor points', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-03T00:00:00Z',
            timeMax: '2020-01-22T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(3);
    });

    it('counts correctly when query starts between 8-day anchor points', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 8, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-05T00:00:00Z',
            timeMax: '2020-01-25T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(3);
    });

    it('counts correctly when query starts between 3-day anchor points', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 3, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-02T00:00:00Z',
            timeMax: '2020-01-11T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(3);
    });
  });

  // --- temporal counting: climatology constrained path ---

  describe('temporal counting — monthly climatology constrained path', () => {
    it('uses climatology counting when temporalEnabled and temporalDays is 0', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 0, isMonthlyClimatology: true },
          temporalBounds: {
            timeMin: '2025-01-01T00:00:00Z',
            timeMax: '2025-12-31T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2025-04-01T00:00:00Z',
            timeMax: '2025-09-01T00:00:00Z',
          },
        }),
      );
      expect(result).toBe(6);
    });
  });

  // --- temporal counting: unconstrained edge cases ---

  describe('temporal counting — unconstrained edge cases', () => {
    it('returns 1 when unconstrained, non-climatology, no dataset temporal bounds', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 1, isMonthlyClimatology: false },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(1);
    });

    it('uses full dataset range for unconstrained monthly resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 30, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-06-01T00:00:00Z',
          },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(6);
    });

    it('uses full dataset range for unconstrained weekly resolution', () => {
      let result = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-29T00:00:00Z',
          },
        }),
        singlePointConstraints({ temporalEnabled: false }),
      );
      expect(result).toBe(5);
    });
  });

  // --- temporal clamping: wider than dataset ---

  describe('temporal clamping — query wider than dataset in both directions', () => {
    it('clamps to dataset range and counts correctly for daily resolution', () => {
      let wide = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2019-01-01T00:00:00Z',
            timeMax: '2021-12-31T00:00:00Z',
          },
        }),
      );
      let exact = performRowCountMath(
        singlePointDataset({
          temporalBounds: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-06-01T00:00:00Z',
            timeMax: '2020-06-10T00:00:00Z',
          },
        }),
      );
      expect(wide).toBe(exact);
      expect(wide).toBe(10);
    });

    it('clamps to dataset range for weekly resolution', () => {
      let wide = performRowCountMath(
        singlePointDataset({
          resolutions: { spatialDegrees: 1, temporalDays: 7, isMonthlyClimatology: false },
          temporalBounds: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-29T00:00:00Z',
          },
        }),
        singlePointConstraints({
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2019-06-01T00:00:00Z',
            timeMax: '2021-06-01T00:00:00Z',
          },
        }),
      );
      expect(wide).toBe(5);
    });
  });

  // --- depth ---

  describe('depth counting', () => {
    it('returns 0 when depth bounds do not overlap', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: true,
          depthCountInRange: 5,
          depthBounds: { depthMin: 0, depthMax: 100 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({
          depthEnabled: true,
          depthRange: { depthMin: 500, depthMax: 1000 },
        }),
      );
      expect(result).toBe(0);
    });

    it('uses depthCountInRange when hasDepth is true', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: true,
          depthCountInRange: 10,
          depthBounds: { depthMin: 0, depthMax: 500 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({
          depthEnabled: true,
          depthRange: { depthMin: 0, depthMax: 500 },
        }),
      );
      expect(result).toBe(10);
    });

    it('ignores depthCountInRange when hasDepth is false', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: false,
          depthCountInRange: 10,
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints(),
      );
      expect(result).toBe(1);
    });

    it('returns 1 when hasDepth is true but depthCountInRange is 0', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: true,
          depthCountInRange: 0,
          depthBounds: { depthMin: 0, depthMax: 500 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({
          depthEnabled: true,
          depthRange: { depthMin: 0, depthMax: 500 },
        }),
      );
      expect(result).toBe(1);
    });

    it('uses depthCountInRange when depthEnabled is false but hasDepth is true', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: true,
          depthCountInRange: 5,
          depthBounds: { depthMin: 0, depthMax: 500 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({
          depthEnabled: false,
        }),
      );
      expect(result).toBe(5);
    });

    it('returns single depth level count correctly', () => {
      let result = performRowCountMath(
        singlePointDataset({
          hasDepth: true,
          depthCountInRange: 1,
          depthBounds: { depthMin: 0, depthMax: 100 },
          temporalBounds: { timeMin: null, timeMax: null },
        }),
        singlePointConstraints({
          depthEnabled: true,
          depthRange: { depthMin: 0, depthMax: 100 },
        }),
      );
      expect(result).toBe(1);
    });
  });

  // --- dimension multiplication ---

  describe('dimension multiplication', () => {
    it('multiplies spatial x temporal x depth x tableCount', () => {
      let result = performRowCountMath(
        makeResolvedInputs({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
          hasDepth: true,
          depthCountInRange: 5,
          depthBounds: { depthMin: 0, depthMax: 500 },
          tableCount: 2,
        }),
        makeConstraints({
          spatialBounds: { latMin: 0, latMax: 10, lonMin: 0, lonMax: 10 },
          temporalEnabled: true,
          temporalRange: {
            timeMin: '2020-01-01T00:00:00Z',
            timeMax: '2020-01-10T00:00:00Z',
          },
          depthEnabled: true,
          depthRange: { depthMin: 0, depthMax: 100 },
        }),
      );
      expect(result).toBe(11 * 11 * 10 * 5 * 2);
    });

    it('multiplies by tableCount', () => {
      let single = performRowCountMath(
        singlePointDataset({ tableCount: 1, temporalBounds: { timeMin: null, timeMax: null } }),
        singlePointConstraints(),
      );
      let triple = performRowCountMath(
        singlePointDataset({ tableCount: 3, temporalBounds: { timeMin: null, timeMax: null } }),
        singlePointConstraints(),
      );
      expect(triple).toBe(single * 3);
    });

    it('treats falsy tableCount as 1', () => {
      let withZero = performRowCountMath(
        singlePointDataset({ tableCount: 0, temporalBounds: { timeMin: null, timeMax: null } }),
        singlePointConstraints(),
      );
      let withOne = performRowCountMath(
        singlePointDataset({ tableCount: 1, temporalBounds: { timeMin: null, timeMax: null } }),
        singlePointConstraints(),
      );
      expect(withZero).toBe(withOne);
    });
  });
});
