import temporalResolutions from '../../../enums/temporalResolutions';
import { formatLatitude, formatLongitude } from './numberFormatting';

const MILLISECONDS_PER_DAY = 86400000;

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

export const extractDateFromString = (stringDate) => {
  let [year, month, day] = stringDate.split('-');
  const date = new Date(year, parseInt(month) - 1, day);
  return date;
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
      start: formatLatitude(Lat_Min),
      end: formatLatitude(Lat_Max),
    },
    lon: {
      start: formatLongitude(Lon_Min),
      end: formatLongitude(Lon_Max),
    },
    time: {
      start: Time_Min ? new Date(Time_Min) : new Date(),
      end: Time_Max ? new Date(Time_Max) : new Date(),
    },
    depth: {
      start: Math.floor(Depth_Min),
      end: Math.ceil(Depth_Max),
    },
  };

  return initialValues;
};
