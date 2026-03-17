import {
  calculatePresetEndpoints,
  calculateLongitudeEndpoints,
  expandEndpointIfNeeded,
} from '../sliderEndpointUtils';

describe('calculatePresetEndpoints', () => {
  it('returns extent that encompasses both preset and collection', () => {
    let preset = {
      southLatitude: -20,
      northLatitude: 20,
      westLongitude: -50,
      eastLongitude: 50,
    };
    let collectionExtent = {
      latMin: -10,
      latMax: 10,
      lonMin: -30,
      lonMax: 30,
    };

    let result = calculatePresetEndpoints(preset, collectionExtent);

    expect(result.latMin).toBeLessThanOrEqual(-20);
    expect(result.latMax).toBeGreaterThanOrEqual(20);
    expect(result.lonMin).toBeLessThanOrEqual(-50);
    expect(result.lonMax).toBeGreaterThanOrEqual(50);
  });

  it('uses collection extent when it exceeds preset', () => {
    let preset = {
      southLatitude: -10,
      northLatitude: 10,
      westLongitude: -20,
      eastLongitude: 20,
    };
    let collectionExtent = {
      latMin: -50,
      latMax: 50,
      lonMin: -100,
      lonMax: 100,
    };

    let result = calculatePresetEndpoints(preset, collectionExtent);

    expect(result.latMin).toBeLessThanOrEqual(-50);
    expect(result.latMax).toBeGreaterThanOrEqual(50);
    expect(result.lonMin).toBeLessThanOrEqual(-100);
    expect(result.lonMax).toBeGreaterThanOrEqual(100);
  });

  it('floors min values and ceils max values', () => {
    let preset = {
      southLatitude: -10.05,
      northLatitude: 10.05,
      westLongitude: -20.05,
      eastLongitude: 20.05,
    };
    let collectionExtent = {
      latMin: -5,
      latMax: 5,
      lonMin: -10,
      lonMax: 10,
    };

    let result = calculatePresetEndpoints(preset, collectionExtent);

    expect(result.latMin).toBe(-10.1);
    expect(result.latMax).toBe(10.1);
    expect(result.lonMin).toBe(-20.1);
    expect(result.lonMax).toBe(20.1);
  });
});

describe('calculateLongitudeEndpoints', () => {
  it('returns full range if collection crosses antimeridian', () => {
    let preset = {
      westLongitude: -50,
      eastLongitude: 50,
    };
    let collectionExtent = {
      lonMin: 170,
      lonMax: -170,
    };

    let result = calculateLongitudeEndpoints(preset, collectionExtent);
    expect(result.lonMin).toBe(-180);
    expect(result.lonMax).toBe(180);
  });

  it('returns full range if preset crosses antimeridian', () => {
    let preset = {
      westLongitude: 170,
      eastLongitude: -170,
    };
    let collectionExtent = {
      lonMin: -50,
      lonMax: 50,
    };

    let result = calculateLongitudeEndpoints(preset, collectionExtent);
    expect(result.lonMin).toBe(-180);
    expect(result.lonMax).toBe(180);
  });

  it('returns computed range when no dateline crossing', () => {
    let preset = {
      westLongitude: -100,
      eastLongitude: 100,
    };
    let collectionExtent = {
      lonMin: -50,
      lonMax: 50,
    };

    let result = calculateLongitudeEndpoints(preset, collectionExtent);

    expect(result.lonMin).toBeLessThanOrEqual(-100);
    expect(result.lonMax).toBeGreaterThanOrEqual(100);
  });
});

describe('expandEndpointIfNeeded', () => {
  it('expands min endpoint when new value is smaller', () => {
    let endpoints = { latMin: -10, latMax: 10 };
    let result = expandEndpointIfNeeded(endpoints, 'latMin', -20);
    expect(result).toBeLessThanOrEqual(-20);
  });

  it('keeps current min when new value is larger', () => {
    let endpoints = { latMin: -10, latMax: 10 };
    let result = expandEndpointIfNeeded(endpoints, 'latMin', -5);
    expect(result).toBe(-10);
  });

  it('expands max endpoint when new value is larger', () => {
    let endpoints = { latMin: -10, latMax: 10 };
    let result = expandEndpointIfNeeded(endpoints, 'latMax', 20);
    expect(result).toBeGreaterThanOrEqual(20);
  });

  it('keeps current max when new value is smaller', () => {
    let endpoints = { latMin: -10, latMax: 10 };
    let result = expandEndpointIfNeeded(endpoints, 'latMax', 5);
    expect(result).toBe(10);
  });

  it('returns new value when current is null', () => {
    let endpoints = { latMin: null, latMax: null };
    expect(expandEndpointIfNeeded(endpoints, 'latMin', -20)).toBe(-20);
    expect(expandEndpointIfNeeded(endpoints, 'latMax', 20)).toBe(20);
  });

  it('returns new value when current is undefined', () => {
    let endpoints = {};
    expect(expandEndpointIfNeeded(endpoints, 'latMin', -20)).toBe(-20);
    expect(expandEndpointIfNeeded(endpoints, 'latMax', 20)).toBe(20);
  });
});
