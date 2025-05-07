// NOTE: the arg default results in a January default
// NOTE: the input field is 1-indexed, not 0-indexed, so we add 1 to the result of getUTCMonth
const transformDateStringToMonth = (dateString = '01-01-1900') => {
  const result = new Date(dateString).getUTCMonth() + 1;
  console.log('date string to month', dateString, result);
  return result;
};

export default transformDateStringToMonth;
