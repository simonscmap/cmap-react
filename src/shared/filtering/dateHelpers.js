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
