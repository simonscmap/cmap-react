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
 * Determines whether a given Excel cell contains a date, time, or datetime value.
 *
 * @param {Object} cell - A single cell object from the dataSheet (e.g., dataSheet["A2"])
 * @returns {string|null} - Returns "date", "time", "datetime", or null if none apply
 */
export function getCellDateType(cell) {
  // To determine if a cell represents a date, time, or datetime, all of the following must be true:
  // - The cell must exist and not be null or undefined
  // - The cell must be of numeric type (`t === 'n'`), as Excel stores dates/times as numbers
  // - The cell must include a `.w` property (formatted string), which shows how the value appears in Excel (e.g., "2/18/2023")
  if (
    !cell ||
    cell.v === null ||
    cell.v === undefined ||
    cell.t !== 'n' ||
    !cell.w
  ) {
    return null;
  }

  const formatted = cell.w;

  if (formatted.match(/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i)) {
    return 'time';
  }

  if (
    isValidDateTimeComponents(formatted) ||
    formatted.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\s\d{1,2}:\d{2}/)
  ) {
    return 'datetime';
  }

  if (
    // Numeric formats: YYYY-MM-DD, YYYY/MM/DD
    formatted.match(/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/) ||
    // Numeric formats: MM/DD/YYYY, DD/MM/YYYY, M/D/YY, etc.
    formatted.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/) ||
    // Text month: 14-Mar-2012, 14-Mar-12, Mar-14-2012, Mar-14-12
    formatted.match(
      /^(?:\d{1,2}|[A-Za-z]{3})[ -][A-Za-z]{3}[ -](?:\d{2}|\d{4})$/,
    ) ||
    // Reversed text month: 14-March-2012 or 14 March 2012
    formatted.match(/^\d{1,2}[ -][A-Za-z]+[ -]\d{4}$/)
  ) {
    return 'date';
  }

  return null;
}

/**
 * Identifies date, time, and datetime columns in an Excel worksheet using metadata
 *
 * @param {Object} dataSheet - The Excel worksheet object from XLSX
 * @returns {Object} - Object containing arrays of column headers for date, time, and datetime columns
 */
export const identifyDateTimeColumns = (dataSheet) => {
  if (!dataSheet || !dataSheet['!ref']) {
    return { dateColumns: [], timeColumns: [], dateTimeColumns: [] };
  }

  const dateTimeColumns = [];

  // mapping column letters to their header values from row 1.
  // {A: 'time', B: 'depth', ...}
  const headers = (() => {
    const result = {};
    Object.keys(dataSheet).forEach((cellRef) => {
      const match = cellRef.match(/([A-Z]+)([0-9]+)/);
      if (match && match[2] === '1' && dataSheet[cellRef].v) {
        const colLetter = match[1];
        result[colLetter] = dataSheet[cellRef].v;
      }
    });
    return result;
  })();

  const columnLetters = Object.keys(headers);

  columnLetters.forEach((columnLetter) => {
    const headerName = headers[columnLetter];

    // Skip the 'time' column as it's handled separately
    if (headerName.toLowerCase() === 'time') {
      return;
    }

    // Only check the first cell in the column (row 2)
    const rowIndex = 2;
    const cellRef = `${columnLetter}${rowIndex}`;
    const cell = dataSheet[cellRef];
    // Skip if cell doesn't exist or has no value
    if (!cell || cell.v === null || cell.v === undefined) {
      return;
    }

    // Use getCellDateType to classify the date/time type
    const dateType = getCellDateType(cell);

    if (dateType === 'time' || dateType === 'datetime' || dateType === 'date') {
      dateTimeColumns.push(headerName);
    }
  });

  return dateTimeColumns;
};

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

  // Convert to milliseconds and round to nearest second to avoid float precision issues
  const utcMilliseconds = Math.round(
    (adjustedSerialDate + 0.5 / 86400 - EXCEL_EPOCH_OFFSET) * MS_PER_DAY,
  );

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
 * Process the time column value for a row
 *
 * @param {Object} row - The data row being processed
 * @param {number} index - The index of the row in the data array
 * @param {Object} dataSheet - The Excel worksheet object from XLSX
 * @param {boolean} is1904 - Whether the workbook uses the 1904 date system
 * @returns {Object} - Object containing conversion results and metadata
 */
export const processTimeColumn = (row, index, dataSheet, is1904) => {
  // Skip null values
  if (row.time === null) {
    return {
      conversionType: TIME_CONVERSION_TYPES.NONE,
      prevValue: null,
      newValue: null,
      prevValueExcelFormatted: null,
      wasChanged: false,
    };
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

  const wasChanged = conversionType !== TIME_CONVERSION_TYPES.NONE;

  return {
    conversionType,
    prevValue,
    newValue,
    prevValueExcelFormatted,
    wasChanged,
  };
};

/**
 * Processes Excel date-time values in one pass through the workbook
 * @param {Object} workbook - The workbook object
 * @returns {Object} - Data, metadata, and conversion status
 */
export default function formatDataSheet(workbook) {
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

  // Identify date, time, and datetime columns
  const dateTimeColumns = identifyDateTimeColumns(dataSheet);

  // Replace other dateTime column numeric values with Excel formatted strings
  // and process time column
  const dataChanges = [];
  data.forEach((row, index) => {
    const timeResult = processTimeColumn(row, index, dataSheet, is1904);

    if (timeResult.wasChanged) {
      dataChanges.push({
        rowIndex: index, // Store the row index for reference
        timeConversionType: timeResult.conversionType,
        prevValue: timeResult.prevValue,
        newValue: timeResult.newValue,
        prevValueExcelFormatted: timeResult.prevValueExcelFormatted,
      });
    }

    // Replace other dateTime column numeric values with Excel formatted strings
    dateTimeColumns.forEach((colHeader) => {
      if (colHeader.toLowerCase() === 'time') {
        return;
      } // Skip 'time' column

      if (typeof row[colHeader] === 'number') {
        const colRef = findHeaderCellReference(dataSheet, colHeader);
        if (colRef) {
          const colLetter = colRef.match(/([A-Z]+)/)[1];
          const cellRef = `${colLetter}${index + 2}`; // Row index is 0-based, Excel starts at 1 + header row
          const cell = dataSheet[cellRef];
          if (cell && cell.w) {
            row[colHeader] = cell.w;
          }
        }
      }
    });
  });

  const deletedKeys = deleteEmptyRows(data);
  return {
    data,
    dataChanges,
    deletedKeys,
    is1904,
  };
}
