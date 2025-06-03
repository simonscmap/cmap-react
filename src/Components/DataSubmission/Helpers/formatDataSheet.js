// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';
import XLSX from 'xlsx';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { isValidDateTimeComponents } from './workbookAuditLib/time';

dayjs.extend(utc);
dayjs.extend(tz);

// Enum-like constants for time conversion types
const TIME_CONVERSION_TYPES = {
  NONE: 'NONE', // No conversion was needed
  EXCEL_TO_UTC: 'EXCEL_TO_UTC', // Excel numeric date converted to UTC
  STRING_NO_TZ_TO_UTC: 'STRING_NO_TZ_TO_UTC', // String without timezone converted to UTC
  STRING_NON_UTC_TO_UTC: 'STRING_NON_UTC_TO_UTC', // String with non-UTC timezone converted to UTC
};

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

  // Verify the result is a valid date
  if (utcISOString === 'Invalid Date') {
    return null;
  }

  return utcISOString;
};

const processTimeString = (timeString) => {
  if (!isValidDateTimeComponents(timeString)) {
    return {
      value: timeString,
      conversionType: TIME_CONVERSION_TYPES.NONE,
    };
  }

  const parsedDate = dayjs(timeString);
  const hasTimezoneInfo = timeString.match(/[Z]|[+-]\d{2}(:?\d{2})?$/);

  if (!hasTimezoneInfo) {
    // No timezone info, convert to UTC
    return {
      value: parsedDate.utc().format(),
      conversionType: TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC,
    };
  } else {
    // Has timezone info - check if it's already UTC
    const offset = parsedDate.utcOffset();

    // Consider both exact zero and very small offsets (floating point precision) as UTC
    // Also explicitly check for +00:00 or Z in the string for redundancy
    if (
      Math.abs(offset) < 1 ||
      timeString.endsWith('Z') ||
      timeString.endsWith('+00:00')
    ) {
      return {
        value: timeString,
        conversionType: TIME_CONVERSION_TYPES.NONE,
      };
    } else {
      return {
        value: parsedDate.utc().format(),
        conversionType: TIME_CONVERSION_TYPES.STRING_NON_UTC_TO_UTC,
      };
    }
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

/**
 * Processes Excel date-time values in one pass through the workbook
 * @param {Object} workbook - The workbook object
 * @returns {Object} - Data, metadata, and conversion status
 */
export default (workbook) => {
  const dataSheet = workbook.Sheets ? workbook.Sheets['data'] : null;
  if (!dataSheet || !dataSheet['!ref']) {
    // Return empty data if no valid sheet found
    return {
      data: [],
      dataChanges: [],
      deletedKeys: [],
      is1904: false,
      numericDateFormatConverted: false,
    };
  }

  // Extract data with the original format
  let data = XLSX.utils.sheet_to_json(dataSheet, {
    defval: null,
  });
  if (
    data.length === 0 ||
    !Object.prototype.hasOwnProperty.call(data[0], 'time')
  ) {
    // No data or no time column
    return {
      data,
      dataChanges: [],
      deletedKeys: deleteEmptyRows(data),
      is1904: false,
      numericDateFormatConverted: false,
    };
  }

  const is1904 = is1904Format(workbook);
  let numericDateFormatConverted = false;

  // Create a parallel dataChanges object to track conversions
  const dataChanges = new Array(data.length);
  // Process all rows at once
  data.forEach((row, index) => {
    // Skip null values
    if (row.time === null) {
      dataChanges[index] = {
        timeConversionType: TIME_CONVERSION_TYPES.NONE,
        prevValue: null,
        newValue: null,
      };
      return;
    }

    // Default conversion type
    let conversionType = TIME_CONVERSION_TYPES.NONE;
    const prevValue = row.time;
    let newValue = prevValue;

    if (typeof row.time === 'number') {
      // Convert the numeric Excel date to UTC string
      const convertedDate = convertExcelSerialDateToUTC(row.time, is1904);

      // Only update if we got a valid date
      if (convertedDate !== null) {
        newValue = convertedDate;
        row.time = newValue;
        conversionType = TIME_CONVERSION_TYPES.EXCEL_TO_UTC;
        numericDateFormatConverted = true;
      }
    } else if (typeof row.time === 'string') {
      // Process string time values
      const result = processTimeString(row.time);
      newValue = result.value;
      row.time = newValue;
      conversionType = result.conversionType;
    }

    // Store conversion type and values in dataChanges
    dataChanges[index] = {
      timeConversionType: conversionType,
      prevValue: prevValue,
      newValue: newValue,
    };
  });

  const deletedKeys = deleteEmptyRows(data);
  return {
    data,
    dataChanges,
    deletedKeys,
    is1904,
    numericDateFormatConverted,
  };
};
