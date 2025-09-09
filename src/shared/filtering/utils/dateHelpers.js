import temporalResolutions from '../../../enums/temporalResolutions';
import { formatLatitude, formatLongitude } from './numberFormatting';

const MILLISECONDS_PER_DAY = 86400000;

const formatDateString = (year, month, day) => {
  return `${year}-${month}-${day}`;
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

export const dateToDay = (min, date) =>
  Math.ceil((new Date(date).getTime() - new Date(min).getTime()) / 86400000);

// convert a date string like "2007-04-09" to "4/9"
export const shortenDate = (str) =>
  str
    .split('-')
    .slice(1)
    .map((n) => parseInt(n, 10))
    .join('/');

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
// with the begin and end dates of a dataset,
// calculate the span of days
export const getMaxDays = (dataset) => {
  let endTime = new Date(dataset.Time_Max).getTime();
  let startTime = new Date(dataset.Time_Min).getTime();
  let differenceInMilliseconds = endTime - startTime;
  let intervalInDays = Math.floor(
    differenceInMilliseconds / MILLISECONDS_PER_DAY,
  );

  /*
log.debug('get max days', {
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    intervalInDays,
    interval: differenceInMilliseconds / MILLISECONDS_PER_DAY,
    dataset,
  });

   */

  return intervalInDays;
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

export const getInitialRangeValues = (dataset) => {
  let { Lat_Max, Lat_Min, Lon_Max, Lon_Min, Time_Min, Depth_Max, Depth_Min } =
    dataset;

  let maxDays = getMaxDays(dataset);

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
      start: Time_Min ? 0 : 1,
      end: Time_Min ? maxDays : 12,
    },
    depth: {
      start: Math.floor(Depth_Min),
      end: Math.ceil(Depth_Max),
    },
    maxDays,
  };

  return initialValues;
};
