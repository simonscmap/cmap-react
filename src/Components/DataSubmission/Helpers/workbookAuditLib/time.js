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
    } else if (len === 19 || len === 20 || len === 23 || len === 24) {
      if (isValidDateTimeString(timeValue)) {
        return 'datetime string';
      }
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

export const isValidDateTimeString = (dateString) => {
  if (!isString(dateString)) {
    return undefined;
  }

  // use different regex based on string length
  // there is only one valid format per string length:

  // 19, 2010-02-09T18:15:00
  // 20, 2010-02-09T18:15:00Z
  // 23, 2010-02-09T18:15:00.000
  // 24, 2010-02-09T18:15:00.000Z
  // 25, 2009-10-20T04:38:00+00:00

  // 19
  const len = dateString.length;

  if (len === 19) {
    const re = new RegExp(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/,
    );
    const result = re.test(dateString);

    if (result === false) {
      return false;
    }
    // NOTE the hack to use dayjs is to replace the ISO separator 'T' with a  space
    // because dayjs validation doesn't have a way of representing 'T' as a separator
    // but we can still use isValid to validate the rest of the time
    const isValid = dayjs(
      dateString.replace('T', ' '),
      'YYYY-MM-DD HH:mm:ss',
      true,
    ).isValid();
    return isValid;
  } else if (len === 20) {
    const re = new RegExp(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z/,
    );
    const result = re.test(dateString);

    if (result === false) {
      return false;
    }
    // NOTE the hack to use dayjs is to replace the ISO separator 'T' with a  space
    // because dayjs validation doesn't have a way of representing 'T' as a separator
    // but we can still use isValid to validate the rest of the time
    // ditto 'Z'
    const d = dateString.replace('T', ' ').replace('Z', '');
    const isValid = dayjs(d, 'YYYY-MM-DD HH:mm:ss', true).isValid();
    return isValid;
  } else if (len === 23) {
    const re = new RegExp(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}/,
    );
    const result = re.test(dateString);

    if (result === false) {
      return false;
    }
    // NOTE the hack to use dayjs is to replace the ISO separator 'T' with a  space
    // because dayjs validation doesn't have a way of representing 'T' as a separator
    // but we can still use isValid to validate the rest of the time
    const d = dateString.replace('T', ' ');
    const isValid = dayjs(d, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid();
    return isValid;
  } else if (len === 24) {
    const re = new RegExp(
      /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/,
    );
    const result = re.test(dateString);

    if (result === false) {
      return false;
    }
    // NOTE the hack to use dayjs is to replace the ISO separator 'T' with a  space
    // because dayjs validation doesn't have a way of representing 'T' as a separator
    // but we can still use isValid to validate the rest of the time
    // ditto 'Z'
    const d = dateString.replace('T', ' ').replace('Z', '');
    const isValid = dayjs(d, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid();
    return isValid;
  }

  // date string is not one of the valid string lengths
  return false;
};
