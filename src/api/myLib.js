export const subsetKey = (key) => (dataArray) => {
  let uniqueValues = new Set ();
  dataArray.forEach (row => uniqueValues.add (row[key]));
  let subsets = new Array (uniqueValues.size);
  for (let i = 0; i < subsets.length; i++) {
    subsets[i] = new Array();
  }

  let subsetIndex = -1;
  let prevValue = -1;

  for (let i = 0; i < dataArray.length; i++) {
    let row = dataArray[i];
    if (row[key] !== prevValue) {
      subsetIndex++;
      prevValue = row[key];
    }
    if (subsets[subsetIndex]) {
      subsets[subsetIndex].push(row);
    }
  }
  // console.log ('incoming data length', dataArray.length ,'outgoing data', ...subsets.map (s => s.length));
  return subsets;
};

export const mapDeep = (fn) => (level) => (src) => {
  if (level === 0) {
    return (fn.call (null, src));
  } else {
    return src.map (mapDeep (fn) (level - 1));
  }
};

export const rowToVal = (row) => row[4];

export const sum = (values) => values.reduce((acc, curr) => acc + curr, 0);

// calculate mean for an array of 2d matrices
export const toMean2D = (matrices) => {
  let subset = [];
  for (let lat = 0; lat < matrices[0].length; lat++) {
    subset.push(new Array ());
    for (let lon = 0; lon < matrices[0][lat].length; lon++) {
      let values = matrices.reduce ((acc, matrix) => {
        if (!isNaN(matrix[lat][lon])) {
          acc.push (matrix[lat][lon]);
        }
        return acc;
      }, []);
      let mean = values.length ? ( sum(values) / values.length) : undefined;
      subset[lat].push (mean);
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
    subset.push(new Array());
    for (let lon = 0; lon < matrices[0][0][lat].length; lon++) {

      let values = matrices.reduce((acc, timeGroup) => {
        timeGroup.forEach ((depthGroup) => {
          if (!isNaN(depthGroup[lat][lon])) {
            acc.push(depthGroup[lat][lon]);
          }
        });

        return acc;
      }, []);

      let mean = values.length ? (sum(values) / values.length) : undefined;

      subset[lat].push(mean);
    }
  }
  return subset;
};

export const getHovertext_ = ({ z, x, y }) => {
  let result = [];
  z.forEach((row, i) => {
    result.push(new Array());
    row.forEach((value, j) => {
      result[i].push(
        `x: ${x[j]} y: ${y[i]}<br /> z: ${z[i][j]}`
      );
    });
  });
  return result;
};

export const toSetArray = (data) => {
  if (!data || !Array.isArray(data)) {
    console.error ('toSetArray received incorrect arg; expecting arrray ', data);
    return [];
  }
  let p = new Set();
  data.forEach (p.add, p);
  return Array.from (p);
};

// See Amr Ali's answer to
// https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
// Solution 3
export const roundToDecimal = (decimal) => (numberToRound) => {
  let powers = [
    1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7,
    1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15,
    1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22
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
      return decimalAdjustRound (-num, decimalPlaces);
    }
    var p = intpow10(decimalPlaces || 0);
    var n = stripError(num * p);
    return Math.round(n) / p;
  };

  return decimalAdjustRound (numberToRound, decimal);
};

// alternative to subsetKey
export const splitByKey = (key) => (dataArray) => {
  if (!Array.isArray(dataArray)) {
    console.error (`received incorrect arg type in splitByKey`, dataArray);
    return [];
  }

  let result = [];
  let i = 0;
  while (dataArray[i]) {
    if (dataArray[i][key] !== (dataArray[i - 1] && dataArray[i - 1][key])) {
      result.push (new Array());
    }
    result[result.length - 1].push (dataArray[i]);
    i++;
  }
  return result;
};

export const spaceTimeGenerateHistogramPlotData = (rows) => {
  // structure data into subsets
  let r = (subsetKey(0)(rows)) // split by date
    .map(subsetKey(3)) // split by depth
    .map((timeGroup) => timeGroup.map(subsetKey(1))); // split by lat

  // map row data to the observation value
  r = mapDeep(rowToVal)(4)(r);

  // create 2d map of mean values
  return toMean3D(r);
};

// Note the difference between this and toMean3D
// There is a new top level of iteration across the subsets,
// but a removed layer of iteration in the value picking from the 'group'
export const meanWithSplit = (subsets) => {
  let subsetsResults = subsets.map ((subset) => {
    let result = [];
    for (let lat = 0; lat < subset[0].length; lat++) {
      result.push(new Array());
      for (let lon = 0; lon < subset[0][lat].length; lon++) {

        let values = subset.reduce((acc, group) => {
          if (!isNaN(group[lat][lon])) {
            acc.push(group[lat][lon]);
          }
          return acc;
        }, []);

        let mean = values.length ? (sum(values) / values.length) : undefined;
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
  let r = (subsetKey (0) (rows)) // split by date
    .map (subsetKey (3))
    .map (group => group.map (subsetKey (1)));

  let t = mapDeep (rowToVal) (4) (r);

  return meanWithSplit (t);
}

export const spaceTimeGenerateHistogramSubsetPlotsSplitByDepth = (rows) => {
  let r = (subsetKey (3) (rows)) // split by depth
    .map (subsetKey (0))
    .map (group => group.map (subsetKey (1)));

  let t = mapDeep (rowToVal) (4) (r);

  return meanWithSplit (t);
}

export const spaceTimeGenerateHistogram2D = (rows) => {
  // structure data into subsets
  let r = (subsetKey(0)(rows)) // split by date
    .map(subsetKey(1)); // split by lat

  // map row data to the observation value
  r = mapDeep(rowToVal)(3)(r);

  // create 2d map of mean values
  return toMean2D(r);
}
