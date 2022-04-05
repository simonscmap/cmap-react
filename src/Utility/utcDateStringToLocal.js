const utcDateStringToLocal = (utcString) => {
  let date = new Date(utcString);
  let utcYear = date.getUTCFullYear();
  let utcMonth = date.getUTCMonth();
  let utcDate = date.getUTCDate();

  let newDate = new Date();
  newDate.setFullYear(utcYear, utcMonth, utcDate);
  return newDate;
};

export default utcDateStringToLocal;
