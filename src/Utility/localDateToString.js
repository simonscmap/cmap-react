const localDateToString = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let nYear = year.toString();
  let nMonth = month < 10 ? '0' + month.toString() : month.toString();
  let nDay = day < 10 ? '0' + day.toString() : day.toString();

  return nYear + '-' + nMonth + '-' + nDay;
};

export default localDateToString;
