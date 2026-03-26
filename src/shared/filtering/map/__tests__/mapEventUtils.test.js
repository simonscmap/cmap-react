import {
  isScaleEvent,
  isStopEvent,
  getConstraintOptions,
} from '../mapEventUtils';

describe('isScaleEvent', () => {
  it('returns true for scale-start', () => {
    expect(isScaleEvent({ type: 'scale-start' })).toBe(true);
  });

  it('returns true for scale', () => {
    expect(isScaleEvent({ type: 'scale' })).toBe(true);
  });

  it('returns true for scale-stop', () => {
    expect(isScaleEvent({ type: 'scale-stop' })).toBe(true);
  });

  it('returns false for move-start', () => {
    expect(isScaleEvent({ type: 'move-start' })).toBe(false);
  });

  it('returns false for move', () => {
    expect(isScaleEvent({ type: 'move' })).toBe(false);
  });

  it('returns false for move-stop', () => {
    expect(isScaleEvent({ type: 'move-stop' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isScaleEvent(null)).toBeFalsy();
  });

  it('returns false for undefined', () => {
    expect(isScaleEvent(undefined)).toBeFalsy();
  });

  it('returns false for empty object', () => {
    expect(isScaleEvent({})).toBeFalsy();
  });

  it('returns false when type is null', () => {
    expect(isScaleEvent({ type: null })).toBeFalsy();
  });

  it('returns false for rescale (does not start with scale)', () => {
    expect(isScaleEvent({ type: 'rescale' })).toBe(false);
  });
});

describe('isStopEvent', () => {
  it('returns true for move-stop', () => {
    expect(isStopEvent({ type: 'move-stop' })).toBe(true);
  });

  it('returns true for scale-stop', () => {
    expect(isStopEvent({ type: 'scale-stop' })).toBe(true);
  });

  it('returns false for move-start', () => {
    expect(isStopEvent({ type: 'move-start' })).toBe(false);
  });

  it('returns false for scale-start', () => {
    expect(isStopEvent({ type: 'scale-start' })).toBe(false);
  });

  it('returns false for move', () => {
    expect(isStopEvent({ type: 'move' })).toBe(false);
  });

  it('returns false for scale', () => {
    expect(isStopEvent({ type: 'scale' })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isStopEvent(null)).toBeFalsy();
  });

  it('returns false for undefined', () => {
    expect(isStopEvent(undefined)).toBeFalsy();
  });

  it('returns false for empty object', () => {
    expect(isStopEvent({})).toBeFalsy();
  });
});

describe('getConstraintOptions', () => {
  it('returns clampLat true when isCreateMode is true', () => {
    let result = getConstraintOptions(true, { type: 'move' });
    expect(result).toEqual({ clampLat: true });
  });

  it('returns clampLat true when isCreateMode is true and toolEventInfo is null', () => {
    let result = getConstraintOptions(true, null);
    expect(result).toEqual({ clampLat: true });
  });

  it('returns clampLat true for update mode with scale event', () => {
    let result = getConstraintOptions(false, { type: 'scale-start' });
    expect(result).toEqual({ clampLat: true });
  });

  it('returns clampLat false for update mode with move event', () => {
    let result = getConstraintOptions(false, { type: 'move' });
    expect(result).toEqual({ clampLat: false });
  });

  it('returns clampLat false for update mode with null toolEventInfo', () => {
    let result = getConstraintOptions(false, null);
    expect(result).toEqual({ clampLat: false });
  });

  it('returns clampLat false for update mode with empty toolEventInfo', () => {
    let result = getConstraintOptions(false, {});
    expect(result).toEqual({ clampLat: false });
  });

  it('returns clampLat true for update mode with scale-stop', () => {
    let result = getConstraintOptions(false, { type: 'scale-stop' });
    expect(result).toEqual({ clampLat: true });
  });

  it('returns clampLat false for update mode with move-stop', () => {
    let result = getConstraintOptions(false, { type: 'move-stop' });
    expect(result).toEqual({ clampLat: false });
  });
});
