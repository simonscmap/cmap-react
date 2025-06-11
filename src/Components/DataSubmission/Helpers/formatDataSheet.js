// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import * as Sentry from '@sentry/react';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { isValidDateTimeComponents } from './workbookAuditLib/time';

dayjs.extend(utc);
dayjs.extend(tz);

// Enum-like constants for time conversion types
export const TIME_CONVERSION_TYPES = {
  NONE: 'NONE', // No conversion was needed
  EXCEL_TO_UTC: 'EXCEL_TO_UTC', // Excel numeric date converted to UTC
  STRING_NO_TZ_TO_UTC: 'STRING_NO_TZ_TO_UTC', // String without timezone converted to UTC
  STRING_NON_UTC_TO_UTC: 'STRING_NON_UTC_TO_UTC', // String with non-UTC timezone converted to UTC
};

const is1904Format = (workbook) => {
  return Boolean(((workbook.Workbook || {}).WBProps || {}).date1904);
};

function findHeaderCellReference(dataSheet, columnHeaderName) {
  return Object.keys(dataSheet).find((key) => {
    const match = key.match(/([A-Z]+)([0-9]+)/);
    if (!match) {
      return false;
    }

    const col = match[1];
    const row = parseInt(match[2], 10);

    // Check header row (assume row 1 is header)
    if (
      row === 1 &&
      dataSheet[`${col}1`] &&
      dataSheet[`${col}1`].v.toLowerCase() === columnHeaderName.toLowerCase()
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Returns the display-formatted string shown in Excel for a given cell, if
 * available. This is the value that users would see in Excel, such as a
 * formatted date string.
 *
 * Excel stores date-time values as numeric serials under the hood, but users
 * typically only see the formatted string (e.g., "2/18/2023"). This function
 * retrieves that string from the worksheet if available, which is useful for
 * auditing or comparing the original user-visible value.
 *
 * @param {number} excelSerialDate - Excel numeric date value
 * @param {Object} dataSheet - The Excel worksheet object from XLSX
 * @param {number} rowIndex - The row index in the Excel file
 * @param {string} columnName - The column name in the Excel file
 * @returns {string|null}
 */
export const getExcelCellDisplayValue = (
  excelSerialDate,
  dataSheet = null,
  rowIndex = null,
  columnName = 'time',
) => {
  // Only process numeric values
  if (typeof excelSerialDate !== 'number') {
    return null;
  }

  try {
    // Find the cell reference (e.g., 'A1', 'B2') for the time column in this row
    if (dataSheet && rowIndex !== null) {
      // First, find column letter for 'time'
      const timeColRef = findHeaderCellReference(dataSheet, columnName);
      if (timeColRef) {
        const colLetter = timeColRef.match(/([A-Z]+)/)[1];
        // Add 2 to rowIndex because Excel is 1-indexed and we also have a header row
        const cellRef = `${colLetter}${rowIndex + 2}`;

        // Get the formatted value if available
        if (dataSheet[cellRef] && dataSheet[cellRef].w) {
          return dataSheet[cellRef].w;
        }
      }
    }

    // If we couldn't get the formatted value from the cell directly, return null
    return null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export const convertExcelSerialDateToUTC = (
  excelSerialDate,
  is1904 = false,
) => {
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

/**
 * Normalizes a time string to UTC ISO 8601 format.
 *
 * This function inspects a date-time string and returns a normalized version
 * in ISO 8601 UTC format, along with metadata describing the type of conversion
 * performed. It handles three scenarios:
 *   1. If the string is invalid or malformed, it returns the original string
 *      with no conversion.
 *   2. If the string is valid but lacks timezone information, it assumes UTC
 *      and appends a 'Z'.
 *   3. If the string includes a non-UTC timezone, it converts it to UTC.
 *
 * @param {string} timeString - A string representing a date-time value.
 * @returns {{ value: string, conversionType: string }} An object with the
 *   normalized value and the type of conversion.
 */
export const normalizeTimeStringToUTC = (timeString) => {
  if (!isValidDateTimeComponents(timeString)) {
    return {
      value: timeString,
      conversionType: TIME_CONVERSION_TYPES.NONE,
    };
  }

  const hasTimezoneInfo = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(timeString);

  if (!hasTimezoneInfo) {
    // No timezone info, assume it's already UTC and add Z suffix
    // Parse as UTC directly instead of using local timezone
    const parsedDateUtc = dayjs.utc(timeString);
    return {
      value: parsedDateUtc.format(),
      conversionType: TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC,
    };
  } else {
    // Assumes local timezone on device unless timeString hasTimezoneInfo
    const parsedDate = dayjs(timeString);
    const offsetInMinutes = parsedDate.utcOffset();

    // Consider both exact zero and very small offsets (floating point
    // precision) as UTC.
    // Also explicitly check for +00:00 or Z in the string for redundancy
    if (
      Math.abs(offsetInMinutes) < 1 ||
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
 * Group time column changes by conversion type with one example per type
 *
 * @param {Array} dataChanges - Array of time column changes
 * @returns {Array} - Processed changes with one example per conversion type
 */
export const groupTimeChangesByConversionType = (dataChanges) => {
  if (!dataChanges || dataChanges.length === 0) {
    return [];
  }

  const seenConversionTypes = new Set();
  const processedChanges = [];

  dataChanges.forEach((change) => {
    if (!seenConversionTypes.has(change.timeConversionType)) {
      seenConversionTypes.add(change.timeConversionType);
      processedChanges.push({
        row: change.rowIndex + 2, // 1-indexed for display
        conversionType: change.timeConversionType,
        prevValue: String(change.prevValue),
        newValue: String(change.newValue),
        prevValueExcelFormatted: change.prevValueExcelFormatted,
      });
    }
  });

  return processedChanges;
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
    };
  }

  const is1904 = is1904Format(workbook);

  // Create a dynamic array to store only actual changes
  const dataChanges = [];

  // Process all rows at once
  data.forEach((row, index) => {
    // Skip null values
    if (row.time === null) {
      return;
    }
    // Default conversion type
    let conversionType = TIME_CONVERSION_TYPES.NONE;
    const prevValue = row.time;
    let newValue = prevValue;
    let prevValueExcelFormatted = null;

    if (typeof row.time === 'number') {
      // Get formatted display value for numeric Excel dates
      prevValueExcelFormatted = getExcelCellDisplayValue(
        prevValue,
        dataSheet,
        index,
        'time',
      );

      // Convert the numeric Excel date to UTC string
      const convertedDate = convertExcelSerialDateToUTC(row.time, is1904);

      // Only update if we got a valid date
      if (convertedDate !== null) {
        newValue = convertedDate;
        row.time = newValue;
        conversionType = TIME_CONVERSION_TYPES.EXCEL_TO_UTC;
      }
    } else if (typeof row.time === 'string') {
      const result = normalizeTimeStringToUTC(row.time);
      newValue = result.value;
      row.time = newValue;
      conversionType = result.conversionType;
    }

    // Only store if an actual change was made (conversionType is not NONE)
    if (conversionType !== TIME_CONVERSION_TYPES.NONE) {
      dataChanges.push({
        rowIndex: index, // Store the row index for reference
        timeConversionType: conversionType,
        prevValue: prevValue,
        newValue: newValue,
        prevValueExcelFormatted,
      });
    }
  });

  const deletedKeys = deleteEmptyRows(data);
  return {
    data,
    dataChanges,
    deletedKeys,
    is1904,
  };
};
