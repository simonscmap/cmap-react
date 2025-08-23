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
