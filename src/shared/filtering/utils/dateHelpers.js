import temporalResolutions from '../../../enums/temporalResolutions';
import { formatLatitude, formatLongitude } from './numberFormatting';

const MILLISECONDS_PER_DAY = 86400000;

const formatDateString = (year, month, day) => {
  return `${year}-${month}-${day}`;
};

const formatSliderDateString = (year, month, day) => {
  return `${year}/${month}/${day}`;
};


const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());

export const dateToDateString = (value) => {
  if (value === null || value === undefined) return value;
  const d = new Date(value);
  if (!isValidDate(d)) return value;
  return d.toISOString().slice(0, 10);
};

export const extractDateFromString = (stringDate) => {
  if (!stringDate) return stringDate;
  const [y, m, d] = stringDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const utcInstantToLocalMidnight = (value) => {
  if (value === null || value === undefined) return value;
  const d = new Date(value);
  if (!isValidDate(d)) return value;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export const localMidnightToUtcInstant = (value) => {
  if (value === null || value === undefined) return value;
  const d = new Date(value);
  if (!isValidDate(d)) return value;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

export const dateToEndOfDayString = (value) => {
  if (value === null || value === undefined) return value;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  // Use UTC calendar day, return explicit UTC timestamp
  const end = new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    23, 59, 59, 999,
  ));

  return end.toISOString();
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
      start: Time_Min ? new Date(Time_Min) : new Date(),
      end: Time_Max ? new Date(Time_Max) : new Date(),
    },
    depth: {
      start: Depth_Min,
      end: Depth_Max,
    },
  };

  return initialValues;
};
