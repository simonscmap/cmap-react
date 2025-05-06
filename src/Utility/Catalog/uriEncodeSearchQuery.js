export default ({
  keywords = '',
  hasDepth,
  timeStart,
  timeEnd,
  latStart,
  latEnd,
  lonStart,
  lonEnd,
  sensor,
}) => {
  if (Array.isArray(keywords) && typeof keywords !== 'string') {
    return '';
  }
  let qString = '';
  keywords
    .split(' ')
    .forEach(
      (keyword, i) =>
        (qString += `${i > 0 ? '&' : ''}keywords=${encodeURIComponent(
          keyword,
        )}`),
    );

  qString +=
    hasDepth === 'yes' || hasDepth === 'no'
      ? `&hasDepth=${hasDepth}`
      : `&hasDepth=any`;
  if (timeStart) {
    qString += `&timeStart=${encodeURIComponent(timeStart)}`;
  }
  if (timeEnd) {
    qString += `&timeEnd=${encodeURIComponent(timeEnd)}`;
  }
  if (latStart || latStart == 0) {
    qString += `&latStart=${encodeURIComponent(latStart)}`;
  }
  if (latEnd || latEnd == 0) {
    qString += `&latEnd=${encodeURIComponent(latEnd)}`;
  }
  if (lonStart || lonStart == 0) {
    qString += `&lonStart=${encodeURIComponent(lonStart)}`;
  }
  if (lonEnd || lonEnd == 0) {
    qString += `&lonEnd=${encodeURIComponent(lonEnd)}`;
  }
  if (sensor !== 'Any' && sensor !== null) {
    qString += `&sensor=${encodeURIComponent(sensor)}`;
  }
  return qString;
};
