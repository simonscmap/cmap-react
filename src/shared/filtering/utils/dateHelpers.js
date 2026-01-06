import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import temporalResolutions from '../../../enums/temporalResolutions';
import { formatLatitude, formatLongitude } from './numberFormatting';

dayjs.extend(utc);

const MILLISECONDS_PER_DAY = 86400000;

export const parseUTCDateString = (isoString) => {
  if (!isoString) {
    return null;
  }

  const d = dayjs.utc(isoString);
  return d.isValid() ? d.toDate() : null;
};

export const formatUTCDate = (date, formatString = 'YYYY-MM-DD') => {
  if (!date) {
    return '';
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return '';
  }

  return d.format(formatString);
};

export const dateToUTCDateString = (date) => formatUTCDate(date, 'YYYY-MM-DD');

export const dateToUTCSlashString = (date) => formatUTCDate(date, 'YYYY/MM/DD');

export const dateToUTCHumanString = (date) => formatUTCDate(date, 'MMM D, YYYY');

export const dateToUTCEndOfDayString = (date) => {
  if (!date) {
    return '';
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return '';
  }

  return d.format('YYYY-MM-DD') + 'T23:59:59';
};

export const getUTCDateComponents = (date) => {
  if (!date) {
    return null;
  }

  const d = dayjs.utc(date);
  if (!d.isValid()) {
    return null;
  }

  return {
    year: d.year(),
    month: d.month() + 1,
    day: d.date(),
  };
};

export const createUTCDate = (year, month, day) => {
  if (year === undefined || month === undefined || day === undefined) {
    return null;
  }

  const d = dayjs.utc(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  return d.isValid() ? d.toDate() : null;
};

const formatDateString = (year, month, day) => {
  return `${year}-${month}-${day}`;
};

const formatSliderDateString = (year, month, day) => {
  return `${year}/${month}/${day}`;
};

export const dateToDateString = (date) => {
  let value = new Date(date);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  return formatDateString(fullYear, month, day);
};

export const dateToEndOfDayString = (date) => {
  let value = new Date(date);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  return `${fullYear}-${month}-${day}T23:59:59`;
};

export const extractDateFromString = (stringDate) => {
  return parseUTCDateString(stringDate);
};

export const emptyStringOrNumber = (val) => {
  return val === '' ? '' : Number(val);
};

export const getIsMonthlyClimatology = (temporalResolution) => {
  return Boolean(temporalResolution === temporalResolutions.monthlyClimatology);
};

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
      start: Time_Min ? parseUTCDateString(Time_Min) : new Date(),
      end: Time_Max ? parseUTCDateString(Time_Max) : new Date(),
    },
    depth: {
      start: Depth_Min,
      end: Depth_Max,
    },
  };

  return initialValues;
};
