// This module is not used
import dayjs from 'dayjs';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(tz);


const timeRe = new RegExp (/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/);


export const isAcceptedFormat = (dateTimeString = '') => {
  const isValid = dayjs(dateTimeString).isValid();
  if (!isValid) {
    return false;
  }

  if (!dateTimeString.match) {
    return false;
  }

  const isExpectedFormat = dateTimeString.match (timeRe);
  if (isExpectedFormat) {
    return true;
  }

  const convertedString = dayjs.utc (dateTimeString).format ();
  if (dateTimeString === convertedString) {
    return true;
  }

  return false;
}



const standardFormat = (dateTimeString = '') => {
  const isValid = dayjs(dateTimeString).isValid();
  if (!isValid) {
    return null;
  }

  if (!isAcceptedFormat (dateTimeString)) {
    return null;
  }

  return dayjs.utc (dateTimeString).format ();
}

export default standardFormat;
