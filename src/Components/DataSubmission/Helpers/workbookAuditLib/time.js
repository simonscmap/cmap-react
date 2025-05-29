import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// import standardFormat from './standardUTCDateTime';

dayjs.extend(utc);
dayjs.extend(tz);

dayjs.extend(customParseFormat);
// see test in Tests/Utility/DataSubmission/workbookAuditLib.test.js

export const validateTimeValues = (data) => {
  let negativeNumberDate = false;
  let integerDate = false;
  let missingDate = false;

  const allFlags = [negativeNumberDate, integerDate, missingDate].every(
    (f) => f === true,
  );

  let k = 0;
  while (!allFlags && k < data.length) {
    let row = data[k];
    if (typeof row.time === 'number') {
      // this block won't be reached because we are in the "else" block of isNumeric
      if (row.time < 0) {
        negativeNumberDate = true;
      } else if (Number.isInteger(row.time)) {
        integerDate = true;
      }
    } else if (row.time === null || row.time === undefined) {
      missingDate = true;
    }
    k += 1;
  }

  return {
    negativeNumberDate,
    integerDate,
    missingDate,
  };
};

export const detectFormat = (timeValue) => {
  if (!timeValue) {
    return undefined;
  }
  if (typeof timeValue === 'number') {
    if (Number.isInteger(timeValue)) {
      return 'integer';
    } else {
      return 'decimal';
    }
  }
  if (typeof timeValue === 'string') {
    const len = timeValue.length;
    if (len === 10 && isValidDateString(timeValue)) {
      return 'date string';
    } else if (
      isValidDateTimePattern(timeValue) &&
      isValidDateTimeComponents(timeValue)
    ) {
      return 'datetime string';
    }

    return 'invalid string';
  }

  return undefined;
};

// check consistency of time values
export const checkTypeConsistencyOfTimeValues = (data) => {
  if (!data || !Array.isArray(data)) {
    return true;
  }
  let isConsistent = true;
  let lastType = typeof data[0].time;
  let strLen = lastType === 'string' ? data[0].time.length : 0;
  for (let k = 1; k < data.length; k++) {
    if (typeof data[k].time !== lastType) {
      isConsistent = false;
      break;
    }
    if (lastType === 'string') {
      if (data[k].time.length !== strLen) {
        // need a better check: 2015/1/15 vs 2015/10/30
        // isConsistent = false;
      }
    }
  }
  return isConsistent;
};

// check valid format
const isString = (s) => typeof s === 'string';

export const isValidDateString = (dateString) => {
  if (!isString(dateString)) {
    return undefined;
  }
  const re = new RegExp(/[0-9]{4}-[0-9]{2}-[0-9]{2}/);
  const result = re.test(dateString);

  if (result !== true) {
    return false;
  }

  const isValidDayjsDate = dayjs(dateString, 'YYYY-MM-DD', true).isValid();

  if (!isValidDayjsDate) {
    return false;
  }

  return true;
};

const isValidRealDateTime = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const parsedDate = new Date(input);

  return !isNaN(parsedDate.getTime());
};

/**
 * Checks if the input string matches a valid ISO 8601 datetime pattern.
 */
export const isValidDateTimePattern = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  // YYYY-MM-DDThh:mm:ss with optional .sss, Z, or timezone offset
  const basicPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}(?::?\d{2})?)?$/;

  return basicPattern.test(input);
};

/**
 * Validates that a date-time string represents a real date and time
 * with no component rollovers (like Feb 30th → Mar 2nd).
 */
const isValidDateTimeComponents = (input) => {
  // This function assumes input has already passed the isValidDateTimePattern check

  // Extract individual parts for validation
  const parts = input.split(/[-T:.Z+]/);

  // Validate year, month, day, hour, minute, second
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const minute = parseInt(parts[4], 10);
  const second = parseInt(parts[5], 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  if (hour < 0 || hour > 23) {
    return false;
  }
  if (minute < 0 || minute > 59) {
    return false;
  }
  if (second < 0 || second > 59) {
    return false;
  }

  return true;
};
