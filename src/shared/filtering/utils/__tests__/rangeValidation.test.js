import {
  roundToStep,
  floorToStep,
  ceilToStep,
  clampValue,
  ABSOLUTE_BOUNDS,
  getAbsoluteBounds,
  getEffectiveBounds,
  getDefaultValue,
} from '../rangeValidation';

describe('roundToStep', () => {
  it('rounds to nearest step', () => {
    expect(roundToStep(1.04, 0.1)).toBe(1);
    expect(roundToStep(1.05, 0.1)).toBe(1.1);
    expect(roundToStep(1.15, 0.1)).toBe(1.1);
  });

  it('handles exact step boundaries', () => {
    expect(roundToStep(1.0, 0.1)).toBe(1.0);
    expect(roundToStep(0.5, 0.1)).toBe(0.5);
    expect(roundToStep(10, 1)).toBe(10);
  });

  it('handles floating-point precision (0.1 + 0.2)', () => {
    expect(roundToStep(0.30000000000000004, 0.1)).toBe(0.3);
  });

  it('handles negative values', () => {
    expect(roundToStep(-1.04, 0.1)).toBe(-1);
    expect(roundToStep(-1.05, 0.1)).toBe(-1);
  });

  it('handles custom step sizes', () => {
    expect(roundToStep(2.3, 0.5)).toBe(2.5);
    expect(roundToStep(2.2, 0.5)).toBe(2);
    expect(roundToStep(7.5, 5)).toBe(10);
  });

  it('defaults to step of 0.1', () => {
    expect(roundToStep(1.04)).toBe(1);
    expect(roundToStep(1.05)).toBe(1.1);
  });
});

describe('floorToStep', () => {
  it('floors to step boundary', () => {
    expect(floorToStep(1.09, 0.1)).toBe(1);
    expect(floorToStep(1.19, 0.1)).toBe(1.1);
  });

  it('returns exact value on step boundary', () => {
    expect(floorToStep(1.0, 0.1)).toBe(1.0);
    expect(floorToStep(1.5, 0.1)).toBe(1.5);
  });

  it('handles floating-point precision', () => {
    expect(floorToStep(0.30000000000000004, 0.1)).toBe(0.3);
  });

  it('handles negative values', () => {
    expect(floorToStep(-1.01, 0.1)).toBe(-1.1);
    expect(floorToStep(-1.0, 0.1)).toBe(-1);
  });

  it('handles custom step sizes', () => {
    expect(floorToStep(2.7, 0.5)).toBe(2.5);
    expect(floorToStep(7, 5)).toBe(5);
  });
});

describe('ceilToStep', () => {
  it('ceils to step boundary', () => {
    expect(ceilToStep(1.01, 0.1)).toBe(1.1);
    expect(ceilToStep(1.11, 0.1)).toBe(1.2);
  });

  it('returns exact value on step boundary', () => {
    expect(ceilToStep(1.0, 0.1)).toBe(1.0);
    expect(ceilToStep(1.5, 0.1)).toBe(1.5);
  });

  it('handles floating-point precision', () => {
    expect(ceilToStep(0.30000000000000004, 0.1)).toBe(0.3);
  });

  it('handles negative values', () => {
    expect(ceilToStep(-1.09, 0.1)).toBe(-1);
    expect(ceilToStep(-1.0, 0.1)).toBe(-1);
  });

  it('handles custom step sizes', () => {
    expect(ceilToStep(2.1, 0.5)).toBe(2.5);
    expect(ceilToStep(3, 5)).toBe(5);
  });
});

describe('clampValue', () => {
  it('clamps value within range', () => {
    expect(clampValue(5, 0, 10)).toBe(5);
    expect(clampValue(-1, 0, 10)).toBe(0);
    expect(clampValue(11, 0, 10)).toBe(10);
  });

  it('returns boundary values when equal', () => {
    expect(clampValue(0, 0, 10)).toBe(0);
    expect(clampValue(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clampValue(0, -90, -10)).toBe(-10);
    expect(clampValue(-100, -90, -10)).toBe(-90);
    expect(clampValue(-50, -90, -10)).toBe(-50);
  });
});

describe('ABSOLUTE_BOUNDS', () => {
  it('has latitude bounds', () => {
    expect(ABSOLUTE_BOUNDS.latitude).toEqual({ min: -90, max: 90 });
    expect(ABSOLUTE_BOUNDS.lat).toEqual({ min: -90, max: 90 });
  });

  it('has longitude bounds', () => {
    expect(ABSOLUTE_BOUNDS.longitude).toEqual({ min: -180, max: 180 });
    expect(ABSOLUTE_BOUNDS.lon).toEqual({ min: -180, max: 180 });
  });

  it('has depth bounds with min only', () => {
    expect(ABSOLUTE_BOUNDS.depth).toEqual({ min: 0 });
  });
});

describe('getAbsoluteBounds', () => {
  it('returns bounds for known field types', () => {
    expect(getAbsoluteBounds('latitude')).toEqual({ min: -90, max: 90 });
    expect(getAbsoluteBounds('lon')).toEqual({ min: -180, max: 180 });
    expect(getAbsoluteBounds('depth')).toEqual({ min: 0 });
  });

  it('returns null for unknown or missing field types', () => {
    expect(getAbsoluteBounds('unknown')).toBeNull();
    expect(getAbsoluteBounds(null)).toBeNull();
    expect(getAbsoluteBounds(undefined)).toBeNull();
  });
});

describe('getEffectiveBounds', () => {
  it('floors min and ceils max', () => {
    let result = getEffectiveBounds(1.03, 9.97, 0.1);
    expect(result.min).toBe(1);
    expect(result.max).toBe(10);
  });

  it('preserves exact boundaries', () => {
    let result = getEffectiveBounds(1.0, 10.0, 0.1);
    expect(result.min).toBe(1.0);
    expect(result.max).toBe(10.0);
  });

  it('defaults to step 0.1', () => {
    let result = getEffectiveBounds(1.03, 9.97);
    expect(result.min).toBe(1);
    expect(result.max).toBe(10);
  });
});

describe('getDefaultValue', () => {
  it('returns floored min for start', () => {
    expect(getDefaultValue(true, 1.03, 9.97, 0.1)).toBe(1);
  });

  it('returns ceiled max for end', () => {
    expect(getDefaultValue(false, 1.03, 9.97, 0.1)).toBe(10);
  });

  it('defaults to step 0.1', () => {
    expect(getDefaultValue(true, 1.03, 9.97)).toBe(1);
    expect(getDefaultValue(false, 1.03, 9.97)).toBe(10);
  });
});
