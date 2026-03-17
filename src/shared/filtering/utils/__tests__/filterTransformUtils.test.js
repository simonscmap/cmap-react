import { transformFiltersForAPI } from '../filterTransformUtils';

describe('transformFiltersForAPI', () => {
  it('returns empty object when no filters match', () => {
    let result = transformFiltersForAPI({});
    expect(result).toEqual({});
  });

  it('transforms temporal filters with UTC date strings', () => {
    let timeStart = new Date(Date.UTC(2020, 0, 1));
    let timeEnd = new Date(Date.UTC(2020, 11, 31));
    let result = transformFiltersForAPI({
      Time_Min: '2020-01-01',
      timeStart,
      timeEnd,
    });

    expect(result.temporal).toBeDefined();
    expect(result.temporal.startDate).toBe('2020-01-01');
    expect(result.temporal.endDate).toBe('2020-12-31T23:59:59');
  });

  it('does not include temporal if Time_Min is falsy', () => {
    let result = transformFiltersForAPI({
      Time_Min: null,
      timeStart: new Date(),
      timeEnd: new Date(),
    });
    expect(result.temporal).toBeUndefined();
  });

  it('transforms spatial filters with clamping', () => {
    let result = transformFiltersForAPI({
      latStart: -100,
      latEnd: 100,
      lonStart: -200,
      lonEnd: 200,
    });

    expect(result.spatial.latMin).toBe(-90);
    expect(result.spatial.latMax).toBe(90);
    expect(result.spatial.lonMin).toBe(-180);
    expect(result.spatial.lonMax).toBe(180);
  });

  it('passes through valid spatial values', () => {
    let result = transformFiltersForAPI({
      latStart: -45,
      latEnd: 45,
      lonStart: -90,
      lonEnd: 90,
    });

    expect(result.spatial.latMin).toBe(-45);
    expect(result.spatial.latMax).toBe(45);
    expect(result.spatial.lonMin).toBe(-90);
    expect(result.spatial.lonMax).toBe(90);
  });

  it('includes depth in spatial object', () => {
    let result = transformFiltersForAPI({
      latStart: 0,
      latEnd: 10,
      lonStart: 0,
      lonEnd: 10,
      depthStart: 0,
      depthEnd: 500,
    });

    expect(result.spatial.depthMin).toBe(0);
    expect(result.spatial.depthMax).toBe(500);
  });

  it('creates spatial object for depth-only filters', () => {
    let result = transformFiltersForAPI({
      depthStart: 0,
      depthEnd: 100,
    });

    expect(result.spatial).toBeDefined();
    expect(result.spatial.depthMin).toBe(0);
    expect(result.spatial.depthMax).toBe(100);
  });

  it('combines temporal, spatial, and depth', () => {
    let result = transformFiltersForAPI({
      Time_Min: '2020-01-01',
      timeStart: new Date(Date.UTC(2020, 0, 1)),
      timeEnd: new Date(Date.UTC(2020, 11, 31)),
      latStart: -45,
      latEnd: 45,
      lonStart: -90,
      lonEnd: 90,
      depthStart: 0,
      depthEnd: 500,
    });

    expect(result.temporal).toBeDefined();
    expect(result.spatial).toBeDefined();
    expect(result.spatial.depthMin).toBe(0);
    expect(result.spatial.depthMax).toBe(500);
  });
});
