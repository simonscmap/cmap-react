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

  return `${d.format('YYYY-MM-DD')}T23:59:59`;
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

export const dateToMonth = (date) => {
  if (!date || typeof date.getUTCMonth !== 'function') return 1;
  return date.getUTCMonth() + 1;
};

export const monthToDate = (month) => {
  let m = Number(month);
  if (isNaN(m) || m < 1 || m > 12) return new Date(Date.UTC(2025, 0, 1));
  return new Date(Date.UTC(2025, m - 1, 1));
};

export const monthPairToDates = (startMonth, endMonth) => {
  let startDate = new Date(Date.UTC(2025, startMonth - 1, 1));
  let endYear = endMonth < startMonth ? 2026 : 2025;
  let endDate = new Date(Date.UTC(endYear, endMonth - 1, 1));
  return { startDate: startDate, endDate: endDate };
};

export const formatDateToYearMonthDay = (date) => {
  if (!date || typeof date.getUTCFullYear !== 'function') return date;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const getClimatologyMessage = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 'Climatology datasets: all 12 months';
  }

  let durationMs = endDate.getTime() - startDate.getTime();
  let oneYearMs = 365.25 * 24 * 60 * 60 * 1000;

  if (durationMs >= oneYearMs) {
    return 'Climatology datasets: all 12 months (date span ≥ 12 months)';
  }

  let startMonth = startDate.getUTCMonth() + 1;
  let endMonth = endDate.getUTCMonth() + 1;

  let months = [];
  if (startMonth <= endMonth) {
    for (let m = startMonth; m <= endMonth; m++) {
      months.push(m);
    }
  } else {
    for (let m = startMonth; m <= 12; m++) {
      months.push(m);
    }
    for (let m = 1; m <= endMonth; m++) {
      months.push(m);
    }
  }

  let count = months.length;
  let startName = SHORT_MONTH_NAMES[startMonth - 1];
  let endName = SHORT_MONTH_NAMES[endMonth - 1];

  if (count === 1) {
    return `Climatology datasets: ${startName} only`;
  }

  return `Climatology datasets: ${startName} – ${endName} (${count} months)`;
};

export const getMonthRangeMessage = (startMonth, endMonth) => {
  let months = [];
  if (startMonth <= endMonth) {
    for (let m = startMonth; m <= endMonth; m++) {
      months.push(m);
    }
  } else {
    for (let m = startMonth; m <= 12; m++) {
      months.push(m);
    }
    for (let m = 1; m <= endMonth; m++) {
      months.push(m);
    }
  }

  let count = months.length;
  let startName = SHORT_MONTH_NAMES[startMonth - 1];
  let endName = SHORT_MONTH_NAMES[endMonth - 1];

  if (count === 12) {
    return 'Climatology-only collection: all 12 months';
  }

  if (count === 1) {
    return `Climatology-only collection: ${startName} only`;
  }

  return `Climatology-only collection: ${startName} – ${endName} (${count} months)`;
};

export const CLIMATOLOGY_TOOLTIP_TEXT =
  'Climatology datasets contain monthly averages, not data at specific dates. ' +
  'Your date range determines which calendar months are included. ' +
  'Ranges over one year naturally cover all 12 months.';

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
