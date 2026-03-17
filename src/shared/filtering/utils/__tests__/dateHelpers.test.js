import {
  parseUTCDateString,
  formatUTCDate,
  dateToUTCDateString,
  dateToUTCSlashString,
  dateToUTCHumanString,
  dateToUTCEndOfDayString,
  getUTCDateComponents,
  createUTCDate,
  extractDateFromString,
  emptyStringOrNumber,
  getIsMonthlyClimatology,
  formatDateToYearMonthDay,
  getInitialRangeValues,
} from '../dateHelpers';

describe('parseUTCDateString', () => {
  it('parses ISO date strings', () => {
    let result = parseUTCDateString('2020-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2020);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(15);
  });

  it('parses ISO datetime strings', () => {
    let result = parseUTCDateString('2020-06-15T12:30:00');
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2020);
    expect(result.getUTCMonth()).toBe(5);
  });

  it('returns null for falsy input', () => {
    expect(parseUTCDateString(null)).toBeNull();
    expect(parseUTCDateString(undefined)).toBeNull();
    expect(parseUTCDateString('')).toBeNull();
  });

  it('returns null for invalid date strings', () => {
    expect(parseUTCDateString('not-a-date')).toBeNull();
  });

  it('handles leap year dates', () => {
    let result = parseUTCDateString('2020-02-29');
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCDate()).toBe(29);
  });
});

describe('formatUTCDate', () => {
  it('formats with default YYYY-MM-DD', () => {
    let date = new Date(Date.UTC(2020, 0, 15));
    expect(formatUTCDate(date)).toBe('2020-01-15');
  });

  it('formats with custom format string', () => {
    let date = new Date(Date.UTC(2020, 5, 15));
    expect(formatUTCDate(date, 'YYYY/MM/DD')).toBe('2020/06/15');
  });

  it('returns empty string for falsy input', () => {
    expect(formatUTCDate(null)).toBe('');
    expect(formatUTCDate(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(formatUTCDate(new Date('invalid'))).toBe('');
  });
});

describe('dateToUTCDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    let date = new Date(Date.UTC(2020, 11, 25));
    expect(dateToUTCDateString(date)).toBe('2020-12-25');
  });
});

describe('dateToUTCSlashString', () => {
  it('returns YYYY/MM/DD format', () => {
    let date = new Date(Date.UTC(2020, 11, 25));
    expect(dateToUTCSlashString(date)).toBe('2020/12/25');
  });
});

describe('dateToUTCHumanString', () => {
  it('returns human-readable format', () => {
    let date = new Date(Date.UTC(2020, 11, 25));
    expect(dateToUTCHumanString(date)).toBe('Dec 25, 2020');
  });
});

describe('dateToUTCEndOfDayString', () => {
  it('appends T23:59:59 to date string', () => {
    let date = new Date(Date.UTC(2020, 0, 15));
    expect(dateToUTCEndOfDayString(date)).toBe('2020-01-15T23:59:59');
  });

  it('returns empty string for falsy input', () => {
    expect(dateToUTCEndOfDayString(null)).toBe('');
    expect(dateToUTCEndOfDayString(undefined)).toBe('');
  });

  it('returns empty string for invalid date', () => {
    expect(dateToUTCEndOfDayString(new Date('invalid'))).toBe('');
  });
});

describe('getUTCDateComponents', () => {
  it('returns year, month, day', () => {
    let date = new Date(Date.UTC(2020, 5, 15));
    expect(getUTCDateComponents(date)).toEqual({
      year: 2020,
      month: 6,
      day: 15,
    });
  });

  it('returns 1-based month', () => {
    let date = new Date(Date.UTC(2020, 0, 1));
    expect(getUTCDateComponents(date).month).toBe(1);

    let dec = new Date(Date.UTC(2020, 11, 31));
    expect(getUTCDateComponents(dec).month).toBe(12);
  });

  it('returns null for falsy input', () => {
    expect(getUTCDateComponents(null)).toBeNull();
    expect(getUTCDateComponents(undefined)).toBeNull();
  });

  it('returns null for invalid date', () => {
    expect(getUTCDateComponents(new Date('invalid'))).toBeNull();
  });
});

describe('createUTCDate', () => {
  it('creates a UTC date', () => {
    let result = createUTCDate(2020, 6, 15);
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2020);
    expect(result.getUTCMonth()).toBe(5);
    expect(result.getUTCDate()).toBe(15);
  });

  it('returns null for undefined components', () => {
    expect(createUTCDate(undefined, 1, 1)).toBeNull();
    expect(createUTCDate(2020, undefined, 1)).toBeNull();
    expect(createUTCDate(2020, 1, undefined)).toBeNull();
  });

  it('pads single-digit months and days', () => {
    let result = createUTCDate(2020, 1, 5);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(5);
  });
});

describe('extractDateFromString', () => {
  it('delegates to parseUTCDateString', () => {
    let result = extractDateFromString('2020-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2020);
  });

  it('returns null for invalid input', () => {
    expect(extractDateFromString(null)).toBeNull();
  });
});

describe('emptyStringOrNumber', () => {
  it('returns empty string for empty string input', () => {
    expect(emptyStringOrNumber('')).toBe('');
  });

  it('converts to number for numeric values', () => {
    expect(emptyStringOrNumber('42')).toBe(42);
    expect(emptyStringOrNumber(42)).toBe(42);
    expect(emptyStringOrNumber('3.14')).toBe(3.14);
  });

  it('returns NaN for non-numeric strings', () => {
    expect(emptyStringOrNumber('abc')).toBeNaN();
  });
});

describe('getIsMonthlyClimatology', () => {
  it('returns true for Monthly Climatology', () => {
    expect(getIsMonthlyClimatology('Monthly Climatology')).toBe(true);
  });

  it('returns false for other resolutions', () => {
    expect(getIsMonthlyClimatology('Daily')).toBe(false);
    expect(getIsMonthlyClimatology('Monthly')).toBe(false);
    expect(getIsMonthlyClimatology(null)).toBe(false);
    expect(getIsMonthlyClimatology(undefined)).toBe(false);
  });
});

describe('formatDateToYearMonthDay', () => {
  it('formats Date to YYYY/MM/DD', () => {
    let date = new Date(Date.UTC(2020, 5, 3));
    expect(formatDateToYearMonthDay(date)).toBe('2020/06/03');
  });

  it('pads month and day with zeros', () => {
    let date = new Date(Date.UTC(2020, 0, 1));
    expect(formatDateToYearMonthDay(date)).toBe('2020/01/01');
  });

  it('returns input if not a Date', () => {
    expect(formatDateToYearMonthDay(null)).toBeNull();
    expect(formatDateToYearMonthDay('2020-01-01')).toBe('2020-01-01');
  });
});

describe('getInitialRangeValues', () => {
  it('initializes ranges from dataset bounds', () => {
    let dataset = {
      Lat_Min: 10.05,
      Lat_Max: 50.95,
      Lon_Min: -120.05,
      Lon_Max: -60.95,
      Time_Min: '2020-01-01',
      Time_Max: '2020-12-31',
      Depth_Min: 0,
      Depth_Max: 100.05,
    };
    let result = getInitialRangeValues(dataset);

    expect(result.lat.start).toBe(10);
    expect(result.lat.end).toBe(51);
    expect(result.lon.start).toBe(-120.1);
    expect(result.lon.end).toBe(-60.9);
    expect(result.time.start).toBeInstanceOf(Date);
    expect(result.time.end).toBeInstanceOf(Date);
    expect(result.depth.start).toBe(0);
    expect(result.depth.end).toBe(100.1);
  });

  it('defaults to 0 for null bounds', () => {
    let dataset = {
      Lat_Min: null,
      Lat_Max: null,
      Lon_Min: null,
      Lon_Max: null,
      Time_Min: null,
      Time_Max: null,
      Depth_Min: null,
      Depth_Max: null,
    };
    let result = getInitialRangeValues(dataset);

    expect(result.lat.start).toBe(0);
    expect(result.lat.end).toBe(0);
    expect(result.lon.start).toBe(0);
    expect(result.lon.end).toBe(0);
    expect(result.depth.start).toBe(0);
    expect(result.depth.end).toBe(0);
  });

  it('uses current date for missing time bounds', () => {
    let dataset = {
      Lat_Min: 0,
      Lat_Max: 0,
      Lon_Min: 0,
      Lon_Max: 0,
      Time_Min: null,
      Time_Max: null,
      Depth_Min: 0,
      Depth_Max: 0,
    };
    let result = getInitialRangeValues(dataset);
    expect(result.time.start).toBeInstanceOf(Date);
    expect(result.time.end).toBeInstanceOf(Date);
  });
});
