import months from '../../../enums/months';

export default (dateString, hasHour, isMonthly) => {
  return isMonthly
    ? months[parseInt(dateString)]
    : hasHour
    ? dateString.slice(0, 10) + ' ' + dateString.slice(11, 16)
    : dateString.slice(0, 10);
};
