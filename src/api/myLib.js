import { format } from 'd3-format';

/*
   Subset data (array of arrays) by a provided key (index).
   For example, if the first index contains a data, subsetKey (0) (data) would return
   an array of arrays, where each array contained all the values with the same date.
*/
export const subsetKey = (keyIndex) => (dataArray) => {
  // only create a subset for unique values
  let uniqueValues = new Set();
  dataArray.forEach((row) => uniqueValues.add(row[keyIndex]));

  /* eslint-disable-next-line */
  let subsets = new Array(uniqueValues.size);
  for (let i = 0; i < subsets.length; i++) {
    /* eslint-disable-next-line */
    subsets[i] = new Array();
  }

  let keys = Array.from(uniqueValues);

  let subsetIndex = -1;
  let prevKey = -1;

  // console.log(`subset by key index ${keyIndex} with data length of ${dataArray.length}`);

  for (let i = 0; i < dataArray.length; i++) {
    let row = dataArray[i];
    let thisKey = row[keyIndex];

    if (keyIndex === 1) {
      // console.log ('key value', thisKey, `trav. len ${dataArray.length} row ${i}`, (thisKey !== prevKey ? 'break' : '.'));
    }

    if (thisKey !== prevKey) {
      if (subsetIndex === subsets.length - 1) {
        // this row is not in-order, find the correct subset to append to
        let resetIdx = keys.indexOf(thisKey);
        subsetIndex = resetIdx;
      } else {
        // the rows ARE in order, just increment the index
        subsetIndex++;
      }

      prevKey = thisKey;
    }

    if (subsets[subsetIndex]) {
      subsets[subsetIndex].push(row);
    }
  }

  // console.log ('incoming data length', dataArray.length ,'outgoing data', subsets.map (s => s.length));

  return subsets;
};

// map the values at a certain depth of nested array
export const mapDeep = (fn) => (level) => (src) => {
  if (level === 0) {
    return fn.call(null, src);
  } else {
    return src.map(mapDeep(fn)(level - 1));
  }
};

export const rowToVal = (row) => row[4];

export const sum = (values) =>
  values.reduce((acc, curr) => {
    if (curr === undefined || isNaN(curr)) {
      // console.log('non number in sum ');
      return acc;
    }
    return acc + curr;
  }, 0);

// calculate mean for an array of 2d matrices
export const toMean2D = (matrices) => {
  let subset = [];
  for (let lat = 0; lat < matrices[0].length; lat++) {
    // for this lat, create an array of values for each lon,
    // where the value is the mean of that lat/lon across all matrices
    /* eslint-disable-next-line */
    subset.push(new Array());
    for (let lon = 0; lon < matrices[0][lat].length; lon++) {
      let values = matrices.reduce((acc, matrix) => {
        if (
          matrix &&
          matrix[lat] &&
          matrix[lat][lon] !== null &&
          !isNaN(matrix[lat][lon])
        ) {
          acc.push(matrix[lat][lon]);
        } else {
          // console.warn ('skip', `lat ${lat} lon ${lon}`, matrix[lat][lon]);
        }
        return acc;
      }, []);
      let mean = values.length ? sum(values) / values.length : undefined;
      subset[lat].push(mean);
    }
  }
  return subset;
};

/* Calculate mean values for 4d data

   Explanation: loop over possible x and y values (lon/lat),
   For each coordinate pair, accumulate all values across
   the time and depth subsets (timeGroup and depthGroup below);

   Generate a 2d map of mean values;   */

export const toMean3D = (matrices) => {
  let subset = [];
  for (let lat = 0; lat < matrices[0][0].length; lat++) {
    /* eslint-disable-next-line */
    subset.push(new Array());
    for (let lon = 0; lon < matrices[0][0][lat].length; lon++) {
      let values = matrices.reduce((acc, timeGroup) => {
        timeGroup.forEach((depthGroup) => {
          if (depthGroup && depthGroup[lat] && depthGroup[lat][lon]) {
            acc.push(depthGroup[lat][lon]);
          }
        });

        return acc;
      }, []);

      let mean = values.length ? sum(values) / values.length : undefined;

      subset[lat].push(mean);
    }
  }
  return subset;
};

export const getHovertext_ = ({ z, x, y, fields, unit }) => {
  let result = [];
  z.forEach((row, i) => {
    /* eslint-disable-next-line */
    result.push(new Array());
    row.forEach((value, j) => {
      let abs = Math.abs(value);
      let formatter = abs > 0.01 && abs < 1000 ? '.2f' : '.2e';

      if (value === null) {
        result[i].push(
          `Lat: ${format('.2f')(y[i])}\xb0` +
            `<br>` +
            `Lon: ${
              x[j] > 180 ? format('.2f')(x[j] - 360) : format('.2f')(x[j])
            }\xb0`,
        );
      } else {
        // result[i].push(`x: ${x[j]} y: ${y[i]}<br /> z: ${z[i][j]}`);

        result[i].push(
          `Lat: ${format('.2f')(y[i])}\xb0` +
            `<br>` +
            `Lon: ${
              x[j] > 180 ? format('.2f')(x[j] - 360) : format('.2f')(x[j])
            }\xb0` +
            '<br>' +
            `${fields}: ${format(formatter)(value)} [${unit}]`,
        );
      }
    });
  });
  return result;
};

export const toSetArray = (data) => {
  if (!data || !Array.isArray(data)) {
    console.error('toSetArray received incorrect arg; expecting arrray ', data);
    return [];
  }
  let p = new Set();
  data.forEach(p.add, p);
  return Array.from(p);
};

// See Amr Ali's answer to
// https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
// Solution 3
export const roundToDecimal = (decimal) => (numberToRound) => {
  let powers = [
    1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13,
    1e14, 1e15, 1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22,
  ];

  let intpow10 = (power) => {
    /* Not in lookup table */
    if (power < 0 || power > 22) {
      return Math.pow(10, power);
    }
    return powers[power];
  };

  // Eliminate binary floating-point inaccuracies.
  let stripError = (num) => {
    if (Number.isInteger(num)) {
      return num;
    }
    return parseFloat(num.toPrecision(15));
  };

  let decimalAdjustRound = (num, decimalPlaces) => {
    if (num < 0) {
      return decimalAdjustRound(-num, decimalPlaces);
    }
    var p = intpow10(decimalPlaces || 0);
    var n = stripError(num * p);
    return Math.round(n) / p;
  };

  let result = decimalAdjustRound(numberToRound, decimal);

  // conserve sign
  if (result > 0 && numberToRound < 0) {
    // this fixes all sorts of plotting bugs
    return 0 - result;
  } else {
    return result;
  }
};

// alternative to subsetKey
export const splitByKey = (key) => (dataArray) => {
  if (!Array.isArray(dataArray)) {
    console.error(`received incorrect arg type in splitByKey`, dataArray);
    return [];
  }

  let result = [];
  let i = 0;
  while (dataArray[i]) {
    if (dataArray[i][key] !== (dataArray[i - 1] && dataArray[i - 1][key])) {
      /* eslint-disable-next-line */
      result.push(new Array());
    }
    result[result.length - 1].push(dataArray[i]);
    i++;
  }
  return result;
};

export const spaceTimeGenerateHistogramPlotData = (rows) => {
  // structure data into subsets
  let r = subsetKey(0)(rows) // split by date
    .map(subsetKey(3)) // split by depth
    .map((timeGroup) => timeGroup.map(subsetKey(1))); // split by lat

  // map row data to the observation value
  r = mapDeep(rowToVal)(4)(r);

  // create 2d map of mean values
  let result = toMean3D(r);
  return result;
};

// Note the difference between this and toMean3D
// There is a new top level of iteration across the subsets,
// but a removed layer of iteration in the value picking from the 'group'
export const meanWithSplit = (subsets) => {
  let subsetsResults = subsets.map((subset) => {
    let result = [];
    for (let lat = 0; lat < subset[0].length; lat++) {
      /* eslint-disable-next-line */
      result.push(new Array());
      for (let lon = 0; lon < subset[0][lat].length; lon++) {
        let values = subset.reduce((acc, group) => {
          if (!isNaN(group[lat][lon])) {
            acc.push(group[lat][lon]);
          }
          return acc;
        }, []);

        let mean = values.length ? sum(values) / values.length : undefined;
        result[lat].push(mean);
      }
    }
    // return mean-calculated 2d array for this subset
    return result;
  });
  // return array of subsets
  return subsetsResults;
};

export const spaceTimeGenerateHistogramSubsetPlotsSplitByDate = (rows) => {
  let r = subsetKey(0)(rows) // split by date
    .map(subsetKey(3))
    .map((group) => group.map(subsetKey(1)));

  let t = mapDeep(rowToVal)(4)(r);

  return meanWithSplit(t);
};

export const spaceTimeGenerateHistogramSubsetPlotsSplitByDepth = (rows) => {
  let r = subsetKey(3)(rows) // split by depth
    .map(subsetKey(0)) // split by date
    .map((group) => group.map(subsetKey(1)));

  let t = mapDeep(rowToVal)(4)(r);

  return meanWithSplit(t);
};

export const spaceTimeGenerateHistogram2D = (rows) => {
  // structure data into subsets

  let r = subsetKey(0)(rows); // split by date

  r = r.map(subsetKey(1)); // split by lat

  // map row data to the observation value
  r = mapDeep(rowToVal)(3)(r);

  // create 2d map of mean values
  let result = toMean2D(r);

  return result;
};
