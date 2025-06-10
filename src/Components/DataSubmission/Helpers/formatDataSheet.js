// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';
import XLSX from 'xlsx';

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

/**
 * Formats an Excel numeric date value to a human-readable string
 * that matches what users would see in Excel
 *
 * @param {number} excelSerialDate - Excel numeric date value
 * @param {boolean} is1904 - Whether the workbook uses the 1904 date system
 * @param {Object} dataSheet - The Excel worksheet object from XLSX
 * @param {number} rowIndex - The row index in the Excel file
 * @param {string} columnName - The column name in the Excel file
 * @returns {string} - Human-readable date string as displayed in Excel
 */
export const formatExcelDateForDisplay = (
  excelSerialDate,
  is1904 = false,
  dataSheet = null,
  rowIndex = null,
  columnName = 'time',
) => {
  if (
    excelSerialDate === null ||
    excelSerialDate === undefined ||
    isNaN(excelSerialDate)
  ) {
    return String(excelSerialDate);
  }

  // Try to get the formatted string directly from the worksheet
  try {
    // Find the cell reference (e.g., 'A1', 'B2') for the time column in this row
    // First, find column letter for 'time'
    const timeColRef = Object.keys(dataSheet).find((key) => {
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
        dataSheet[`${col}1`].v.toLowerCase() === columnName.toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    if (timeColRef) {
      const colLetter = timeColRef.match(/([A-Z]+)/)[1];
      // Add 2 to rowIndex because Excel is 1-indexed and we also have a header row
      const cellRef = `${colLetter}${rowIndex + 2}`;

      // Get the formatted value if available
      if (dataSheet[cellRef] && dataSheet[cellRef].w) {
        return dataSheet[cellRef].w;
      }
    }

    return XLSX.SSF.format('yyyy-mm-dd hh:mm:ss', excelSerialDate);
  } catch (error) {
    console.error('Error formatting Excel date:', error);
    // Fallback to simple date formatting
    const EXCEL_EPOCH_OFFSET = 25569;
    const MS_PER_DAY = 86400 * 1000;
    const DAYS_BETWEEN_1900_AND_1904 = 1462;

    const adjustedSerialDate = is1904
      ? excelSerialDate + DAYS_BETWEEN_1900_AND_1904
      : excelSerialDate;

    const roundedValue = Math.ceil(adjustedSerialDate * 1e7) / 1e7;
    const utcMilliseconds = (roundedValue - EXCEL_EPOCH_OFFSET) * MS_PER_DAY;
    return dayjs.utc(utcMilliseconds).format('YYYY-MM-DD HH:mm:ss');
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

export const processTimeString = (timeString) => {
  if (!isValidDateTimeComponents(timeString)) {
    return {
      value: timeString,
      conversionType: TIME_CONVERSION_TYPES.NONE,
    };
  }

  const hasTimezoneInfo = timeString.match(/[Z]|[+-]\d{2}(:?\d{2})?$/);

  if (!hasTimezoneInfo) {
    // No timezone info, assume it's already UTC and add Z suffix
    // Parse as UTC directly instead of using local timezone
    const parsedDateUtc = dayjs.utc(timeString);
    return {
      value: parsedDateUtc.format(),
      conversionType: TIME_CONVERSION_TYPES.STRING_NO_TZ_TO_UTC,
    };
  } else {
    // Has timezone info - check if it's already UTC
    const parsedDate = dayjs(timeString);
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
    let prevValueExcelFormatted = formatExcelDateForDisplay(
      prevValue,
      is1904,
      dataSheet,
      index,
      'time',
    );
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
    numericDateFormatConverted,
  };
};
