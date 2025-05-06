// Interval is number of indices between changes in this parameter, or in order words
// how many times will we see the same value for this parameter in a row before it changes
// as we iterate through the values array.
// We use modulo for cases where data.length / interval is larger than the number of
// distinct values for that parameter.

const splitData = (data, changeInterval, numDistinct) => {
  var split = [];

  for (let i = 0; i < numDistinct; i++) {
    split.push([]);
  }

  for (let i = 0; i < data.length; i++) {
    let index = Math.floor(i / changeInterval) % numDistinct;
    if (!split[index]) {
      console.log('undefined split index');
      console.table(split);
      console.log(
        `index ${index}; changeInterval ${changeInterval}; numDistinct ${numDistinct}`,
      );
    }
    split[index].push(data[i]);
  }

  return split;
};

export default splitData;
