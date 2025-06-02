// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(tz);

const is1904Format = (workbook) => {
  return Boolean(((workbook.Workbook || {}).WBProps || {}).date1904);
};

const convertExcelSerialDateToUTC = (excelSerialDate, is1904 = false) => {
  const EXCEL_EPOCH_OFFSET = 25569; // Days from 1900-01-01 to 1970-01-01
  const MS_PER_DAY = 86400 * 1000; // Milliseconds in one day
  const DAYS_BETWEEN_1900_AND_1904 = 1462; // Days difference for 1904-based Excel dates

  // Adjust for 1904 date system if needed
  const adjustedSerialDate = is1904
    ? excelSerialDate + DAYS_BETWEEN_1900_AND_1904
    : excelSerialDate;

  // Round to 7 decimal places for precision
  const roundedValue = Math.ceil(adjustedSerialDate * 1e7) / 1e7;

  // Convert to milliseconds since Unix epoch
  const utcMilliseconds = (roundedValue - EXCEL_EPOCH_OFFSET) * MS_PER_DAY;

  // Format as ISO 8601 string in UTC
  const utcISOString = dayjs.utc(utcMilliseconds).format();

  return utcISOString;
};

const isNumericFormat = (data) => {
  if (
    !data ||
    !Array.isArray(data) ||
    (data[0] && data[0].time === undefined)
  ) {
    return undefined;
  }
  const sample = data[0].time;
  if (typeof sample === 'number') {
    return true;
  } else {
    return false;
  }
};

const isExcelDateTimeFormat = (data) => {
  if (
    !data ||
    !Array.isArray(data) ||
    (data[0] && data[0].time === undefined)
  ) {
    return undefined;
  }
  const sample = data[0].time;
  // excel date formats are decimal values
  if (typeof sample === 'number' && !Number.isInteger(sample)) {
    return true;
  } else {
    return false;
  }
};

const deleteEmptyRows = (data) => {
  let cols = Object.keys(data[0]);
  let keysContaining__EMPTY = [];
  cols.forEach((e) => {
    if (e.indexOf('__EMPTY') !== -1) {
      keysContaining__EMPTY.push(e);
    }
  });

  if (keysContaining__EMPTY.length) {
    data.forEach((e) => {
      keysContaining__EMPTY.forEach((key) => {
        delete e[key];
      });
    });
  }

  return keysContaining__EMPTY;
};

const convertExcelDateTimeToString = (data, is1904 = false) => {
  data.forEach((row) => {
    const newUTCDateString = convertExcelSerialDateToUTC(row.time, is1904);
    row.time = newUTCDateString;
  });
};

/* The following formatting aims to provide a minimal parsing of time values:
   - if the value in numeric it will be converted to a string
   - if the provided sheet is in 1904 excel format, a appropriate specifc conversion will be used
   - if the value is a string, it will merely be tested to see if it can be instantiated as a valid date object
   - a critical error will be flagged if a numeric date is negative, or if a string cannot become a valid date
 */
export default (data, workbook) => {
  // parseable date? Convert to UTC string
  // is1904?
  // flags
  let numericDateFormatConverted = false;
  // predicates
  const isNumeric = isNumericFormat(data);
  const is1904 = is1904Format(workbook);
  const isExcelDateTime = isExcelDateTimeFormat(data);

  if (isNumeric) {
    if (isExcelDateTime) {
      if (is1904) {
        // audit will raise error
      } else {
        convertExcelDateTimeToString(data, is1904);
        numericDateFormatConverted = true;
      }
    }
  }

  const deletedKeys = deleteEmptyRows(data);

  return {
    data,
    deletedKeys,
    is1904,
    numericDateFormatConverted,
  };
};
