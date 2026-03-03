import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import temporalResolutions from '../../../enums/temporalResolutions';
import { floorToStep, ceilToStep } from './rangeValidation';

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

export const extractDateFromString = (stringDate) => {
  return parseUTCDateString(stringDate);
};

export const emptyStringOrNumber = (val) => {
  return val === '' ? '' : Number(val);
};

export const getIsMonthlyClimatology = (temporalResolution) => {
  return Boolean(temporalResolution === temporalResolutions.monthlyClimatology);
};

export const formatDateToYearMonthDay = (date) => {
  if (!date || typeof date.getUTCFullYear !== 'function') return date;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const SLIDER_STEP = 0.1;

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
      start: Lat_Min != null ? floorToStep(Lat_Min, SLIDER_STEP) : 0,
      end: Lat_Max != null ? ceilToStep(Lat_Max, SLIDER_STEP) : 0,
    },
    lon: {
      start: Lon_Min != null ? floorToStep(Lon_Min, SLIDER_STEP) : 0,
      end: Lon_Max != null ? ceilToStep(Lon_Max, SLIDER_STEP) : 0,
    },
    time: {
      start: Time_Min ? parseUTCDateString(Time_Min) : new Date(),
      end: Time_Max ? parseUTCDateString(Time_Max) : new Date(),
    },
    depth: {
      start: Depth_Min != null ? floorToStep(Depth_Min, SLIDER_STEP) : 0,
      end: Depth_Max != null ? ceilToStep(Depth_Max, SLIDER_STEP) : 0,
    },
  };

  return initialValues;
};
