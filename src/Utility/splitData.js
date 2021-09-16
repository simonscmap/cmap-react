// Interval is number of indices between changes in this parameter, or in order words
// how many times will we see the same value for this parameter in a row before it changes
// as we iterate through the values array.
// We use modulo for cases where data.length / interval is larger than the number of 
// distinct values for that parameter.

const splitData = (data, changeInterval, numDistinct) => {
    var splitData = [];

    for(let i = 0; i < numDistinct; i++){
        splitData.push([]);
    }

    for(let i = 0; i < data.length; i++){
        let index = Math.floor(i / changeInterval) % numDistinct;
        splitData[index].push(data[i]);
    }

    return splitData;
}

export default splitData;