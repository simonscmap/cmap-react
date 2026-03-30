let formatCompactNumber = (count) => {
  if (count >= 1e12) {
    return (count / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  }
  if (count >= 1e9) {
    return (count / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  return count.toLocaleString();
};

module.exports = { formatCompactNumber };
