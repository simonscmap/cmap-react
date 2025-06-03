// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
import dayjs from 'dayjs';
import XLSX from 'xlsx';

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

/**
 * Finds the column letter (A, B, C, etc.) that contains the specified header name
 * @param {Object} dataSheet - The worksheet object from the workbook
 * @param {String} headerName - The name of the header to find
 * @returns {String|null} - The column letter or null if not found
 */
const findColumnLetterByHeaderName = (dataSheet, headerName) => {
  if (!dataSheet || !dataSheet['!ref'] || !headerName) {
    return null;
  }

  // Find column reference (like 'A' or 'B' etc.)
  const range = XLSX.utils.decode_range(dataSheet['!ref'] || 'A1');
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c }); // Header row
    const cell = dataSheet[cellRef];
    if (cell && cell.v === headerName) {
      return XLSX.utils.encode_col(c);
    }
  }

  return null;
};

/**
 * Deterministically checks if a cell contains an Excel date value
 * @param {Object} cell - The cell object from the worksheet
 * @returns {Boolean} - True if the cell is a date
 */
const isCellDate = (cell) => {
  // Check if cell exists and is numeric
  if (!cell || cell.t !== 'n') {
    return false;
  }

  // Use XLSX.js built-in date detection
  return XLSX.SSF.is_date(cell.z);
};

const isExcelDateTimeFormat = (workbook) => {
  // Check if workbook is valid
  if (!workbook || typeof workbook !== 'object') {
    return false;
  }

  const dataSheet = workbook.Sheets ? workbook.Sheets['data'] : null;
  if (!dataSheet) {
    return false;
  }

  // Find which column contains 'time'
  const timeColumn = findColumnLetterByHeaderName(dataSheet, 'time');
  if (!timeColumn) {
    return false;
  }

  // Check the first data cell in the time column
  const firstDataCellRef = timeColumn + '2'; // Assuming row 2 is the first data row
  const firstDataCell = dataSheet[firstDataCellRef];

  return isCellDate(firstDataCell);
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
export default (workbook) => {
  let data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {
    defval: null,
  });

  let numericDateFormatConverted = false;

  const is1904 = is1904Format(workbook);
  const isExcelDateTime = isExcelDateTimeFormat(workbook);

  if (isExcelDateTime) {
    convertExcelDateTimeToString(data, is1904);
    numericDateFormatConverted = true;
  }

  const deletedKeys = deleteEmptyRows(data);

  return {
    data,
    deletedKeys,
    is1904,
    numericDateFormatConverted,
  };
};
