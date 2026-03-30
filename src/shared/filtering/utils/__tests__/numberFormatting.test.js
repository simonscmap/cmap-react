import { formatLatitude, formatLongitude } from '../numberFormatting';

describe('formatLatitude', () => {
  it('rounds to 1 decimal place', () => {
    expect(formatLatitude(45.67)).toBe(45.7);
    expect(formatLatitude(45.64)).toBe(45.6);
    expect(formatLatitude(45.65)).toBe(45.7);
  });

  it('handles integer values', () => {
    expect(formatLatitude(45)).toBe(45);
    expect(formatLatitude(0)).toBe(0);
  });

  it('handles negative values', () => {
    expect(formatLatitude(-45.67)).toBe(-45.7);
    expect(formatLatitude(-45.64)).toBe(-45.6);
  });

  it('handles boundary values', () => {
    expect(formatLatitude(90)).toBe(90);
    expect(formatLatitude(-90)).toBe(-90);
  });

  it('handles floating-point precision issues', () => {
    expect(formatLatitude(0.1 + 0.2)).toBe(0.3);
  });
});

describe('formatLongitude', () => {
  it('rounds to 1 decimal place', () => {
    expect(formatLongitude(120.67)).toBe(120.7);
    expect(formatLongitude(120.64)).toBe(120.6);
  });

  it('handles negative values', () => {
    expect(formatLongitude(-120.67)).toBe(-120.7);
    expect(formatLongitude(-120.64)).toBe(-120.6);
  });

  it('handles boundary values', () => {
    expect(formatLongitude(180)).toBe(180);
    expect(formatLongitude(-180)).toBe(-180);
  });

  it('handles floating-point precision issues', () => {
    expect(formatLongitude(0.1 + 0.2)).toBe(0.3);
  });
});
