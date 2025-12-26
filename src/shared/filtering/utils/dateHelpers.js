import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import temporalResolutions from '../../../enums/temporalResolutions';
import { formatLatitude, formatLongitude } from './numberFormatting';

// Initialize dayjs UTC plugin
dayjs.extend(utc);

const MILLISECONDS_PER_DAY = 86400000;

// =============================================================================
// UTC DATE UTILITIES
// =============================================================================
// All dataset dates in CMAP are UTC. These functions ensure correct handling
// regardless of the user's local timezone.
//
// IMPORTANT: Always use these functions when:
// - Parsing date strings from the API/database (use parseUTCDateString)
// - Formatting dates for display or API (use formatUTCDate or convenience wrappers)
// =============================================================================

/**
 * Parse an ISO date string as UTC midnight.
 *
 * JavaScript's `new Date("2020-01-15")` parses as LOCAL midnight, which causes
 * dates to shift for users east of UTC when converted back via toISOString().
 * This function ensures consistent UTC interpretation.
 *
 * @param {string} isoString - ISO date string (YYYY-MM-DD or full ISO format)
 * @returns {Date|null} Date object representing UTC midnight, or null if invalid
 *
 * @example
 * // User in UTC+12 (New Zealand)
 * new Date("2020-01-15")           // → Jan 15 00:00 local = Jan 14 12:00 UTC (WRONG)
 * parseUTCDateString("2020-01-15") // → Jan 15 00:00 UTC (CORRECT)
 */
export const parseUTCDateString = (isoString) => {
  if (!isoString) {
    return null;
  }

  const d = dayjs.utc(isoString);
  return d.isValid() ? d.toDate() : null;
};

/**
 * Format a date (Date object or string) to a string using UTC components.
 *
 * This is the core formatting function - use this directly with custom formats
 * or use the convenience wrappers below for common formats.
 *
 * @param {Date|string} date - Date object or date string to format
 * @param {string} formatString - dayjs format string (default: 'YYYY-MM-DD')
 * @returns {string} Formatted date string in UTC, or empty string if invalid
 *
 * @example
 * formatUTCDate(date, 'YYYY-MM-DD')   // "2020-01-15"
 * formatUTCDate(date, 'YYYY/MM/DD')   // "2020/01/15"
 * formatUTCDate(date, 'MMM D, YYYY')  // "Jan 15, 2020"
 */
export const formatUTCDate = (date, formatString = 'YYYY-MM-DD') => {
  if (!date) {
    return '';
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return '';
  }

  return d.format(formatString);
};

/**
 * Format a Date object to YYYY-MM-DD string using UTC components.
 * Use this when sending dates to the API.
 *
 * @param {Date|string} date - Date object or string to format
 * @returns {string} Date string in YYYY-MM-DD format (UTC)
 */
export const dateToUTCDateString = (date) => formatUTCDate(date, 'YYYY-MM-DD');

/**
 * Format a Date object to YYYY/MM/DD string using UTC components.
 * Use this for slider displays.
 *
 * @param {Date|string} date - Date object or string to format
 * @returns {string} Date string in YYYY/MM/DD format (UTC)
 */
export const dateToUTCSlashString = (date) => formatUTCDate(date, 'YYYY/MM/DD');

/**
 * Format a Date object to human-readable string (e.g., "Jan 15, 2020") using UTC.
 * Use this for user-facing displays.
 *
 * @param {Date|string} date - Date object or string to format
 * @returns {string} Date string in "MMM D, YYYY" format (UTC)
 */
export const dateToUTCHumanString = (date) => formatUTCDate(date, 'MMM D, YYYY');

/**
 * Format a Date object to YYYY-MM-DDTHH:MM:SS string with end-of-day time (UTC).
 *
 * Used for max date bounds to ensure the entire day is included in queries.
 *
 * @param {Date|string} date - Date object or string to format
 * @returns {string} Date string with time set to 23:59:59 (UTC day)
 */
export const dateToUTCEndOfDayString = (date) => {
  if (!date) {
    return '';
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return '';
  }

  return d.format('YYYY-MM-DD') + 'T23:59:59';
};

/**
 * Extract UTC date components (year, month, day) from a Date object.
 * Use this when you need individual date parts in UTC.
 *
 * @param {Date} date - Date object to extract components from
 * @returns {Object|null} Object with { year, month, day } in UTC, or null if invalid
 *
 * @example
 * const parts = getUTCDateComponents(new Date('2020-01-15T00:00:00Z'));
 * // Returns { year: 2020, month: 1, day: 15 }
 */
export const getUTCDateComponents = (date) => {
  if (!date) {
    return null;
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return null;
  }

  return {
    year: d.year(),
    month: d.month() + 1, // dayjs months are 0-indexed
    day: d.date(),
  };
};

/**
 * Create a Date object at UTC midnight from year, month, day components.
 * Use this when constructing dates from individual parts.
 *
 * @param {number} year - Full year (e.g., 2020)
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month (1-31)
 * @returns {Date|null} Date object at UTC midnight, or null if invalid
 *
 * @example
 * const date = createUTCDate(2020, 1, 15);
 * // Returns Date representing 2020-01-15T00:00:00.000Z
 */
export const createUTCDate = (year, month, day) => {
  if (year === undefined || month === undefined || day === undefined) {
    return null;
  }

  const d = dayjs.utc(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  return d.isValid() ? d.toDate() : null;
};

const formatDateString = (year, month, day) => {
  return `${year}-${month}-${day}`;
};

const formatSliderDateString = (year, month, day) => {
  return `${year}/${month}/${day}`;
};

// :: Date -> DateString
export const dateToDateString = (date) => {
  let value = new Date(date);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  return formatDateString(fullYear, month, day);
};

// Convert Date to ISO date string with end-of-day time for max bounds
// This ensures that when we filter with "date <= maxDate", we include
// all data from that entire day, not just midnight
export const dateToEndOfDayString = (date) => {
  let value = new Date(date);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  // Return date with time set to 23:59:59
  return `${fullYear}-${month}-${day}T23:59:59`;
};

export const extractDateFromString = (stringDate) => {
  // Use UTC parsing to avoid timezone issues
  return parseUTCDateString(stringDate);
};

export const emptyStringOrNumber = (val) => {
  return val === '' ? '' : Number(val);
};

export const getIsMonthlyClimatology = (temporalResolution) => {
  return Boolean(temporalResolution === temporalResolutions.monthlyClimatology);
};

// starting with a min date, return a string representation
// of the date N days later
// :: Date -> Days Int -> Date String
// Note: a Date String is in the format "yyyy-mm-dd"
export const dayToDateString = (min, days) => {
  if (!min) {
    console.error('dayToDateString received no value for min');
  }
  let value = new Date(min);

  value.setDate(value.getDate() + days);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  return formatDateString(fullYear, month, day);
};

export const formatDateToYearMonthDay = (date) => {
  if (!date || typeof date.getFullYear !== 'function') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getInitialRangeValues = (dataset) => {
  let {
    Lat_Max,
    Lat_Min,
    Lon_Max,
    Lon_Min,
    Time_Min,
    Time_Max,
    Depth_Max,
    Depth_Min,
  } = dataset;

  let initialValues = {
    lat: {
      start: Lat_Min,
      end: Lat_Max,
    },
    lon: {
      start: Lon_Min,
      end: Lon_Max,
    },
    time: {
      // Use UTC parser to correctly interpret database date strings
      start: Time_Min ? parseUTCDateString(Time_Min) : new Date(),
      end: Time_Max ? parseUTCDateString(Time_Max) : new Date(),
    },
    depth: {
      start: Depth_Min,
      end: Depth_Max,
    },
  };

  return initialValues;
};
