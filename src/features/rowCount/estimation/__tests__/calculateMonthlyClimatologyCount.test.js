import { calculateMonthlyClimatologyCount } from '../performRowCountMath';

let utcDate = (year, month, day) => {
  return new Date(Date.UTC(year, month - 1, day));
};

describe('calculateMonthlyClimatologyCount', () => {
  it('returns 1 for same month (Jan to Jan)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 1, 1),
      utcDate(2025, 1, 31),
    )).toBe(1);
  });

  it('returns 6 for forward range (Mar to Aug)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 3, 1),
      utcDate(2025, 8, 1),
    )).toBe(6);
  });

  it('returns 4 for wrap range (Nov to Feb, cross-year)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 11, 1),
      utcDate(2026, 2, 1),
    )).toBe(4);
  });

  it('returns 12 for full year (Jan to Dec)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 1, 1),
      utcDate(2025, 12, 1),
    )).toBe(12);
  });

  it('returns 2 for Dec to Jan (cross-year)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 12, 1),
      utcDate(2026, 1, 1),
    )).toBe(2);
  });

  it('returns 1 for Dec to Dec', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 12, 1),
      utcDate(2025, 12, 31),
    )).toBe(1);
  });

  it('returns 12 when span exceeds one year (Oct 2020 to Dec 2022)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2020, 10, 10),
      utcDate(2022, 12, 16),
    )).toBe(12);
  });

  it('returns 12 when span is exactly one year', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 1, 1),
      utcDate(2026, 1, 1),
    )).toBe(12);
  });

  it('returns 11 when span is just under one year (Jan to Nov, same year)', () => {
    expect(calculateMonthlyClimatologyCount(
      utcDate(2025, 1, 1),
      utcDate(2025, 11, 1),
    )).toBe(11);
  });
});
