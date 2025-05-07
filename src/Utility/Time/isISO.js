// https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
    return false;
  }
  const d = new Date(str);
  return d instanceof Date && !isNaN(d) && d.toISOString() === str;
}

export default isIsoDate;
