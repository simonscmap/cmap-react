import { mean, deviation } from 'd3-array';
import auditFactory, {
  makeIssueList,
  requireData,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'NaN and Outlier';
const DESCRIPTION = 'Check user variables for NaN and Outlier values';

let nanVariants = new Set(['nan', 'NaN', 'NAN', 'Nan', 'null', 'Null', 'NULL']);
let checkNaNs = (data, userVariables) => {
  let result = []; // {row, column}

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < userVariables.length; j++) {
      if (nanVariants.has(data[i][userVariables[j]])) {
        result.push({ row: i + 2, column: userVariables[j] });
        if (result.length > 4) {
          return result;
        }
      }
    }
  }

  return result;
};


let outlierN = 5;
let checkOutliers = (data, userVariables) => {
  let outliers = []; //{row, column}
  let vectors = {};
  userVariables.forEach((e) => (vectors[e] = []));

  let stats = {};
  userVariables.forEach((e) => (stats[e] = {}));

  data.forEach((row) => {
    userVariables.forEach((e) => {
      vectors[e].push(row[e]);
    });
  });

  userVariables.forEach((e) => {
    stats[e].mean = mean(vectors[e]);
    stats[e].deviation = deviation(vectors[e]);
  });

  let keys = Object.keys(stats);

  for (let i = 0; i < keys.length; i++) {
    if (
      (stats[keys[i]].mean || stats[keys[i]].mean === 0) &&
      (stats[keys[i]].deviation || stats[keys[i]].deviation === 0)
    ) {
      for (let j = 0; j < data.length; j++) {
        if (
          (data[j][keys[i]] || data[j][keys[i]] == 0) &&
          Math.abs(data[j][keys[i]] - stats[keys[i]].mean) >
          outlierN * stats[keys[i]].deviation
        ) {
          outliers.push({
            row: j + 2,
            column: keys[i],
            value: data[j][keys[i]],
          });
          if (outliers.length > 9) {
            return outliers;
          }
        }
      }
    }
  }

  return outliers;
};



// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = []

  const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  const userVariables = new Set(Object.keys(data[0]).filter((key) => !fixedVariables.has(key)));

  // check
  let containsNaNs = checkNaNs(data, userVariables);
  if (containsNaNs.length) {
    let msg = 'NaN and null strings are not allowed. Cells should contain a value or be blank. Please check the following cells (showing a maximum of 5 cells).';
    results.push(makeIssueList(
      severity.error,
      'NaN Values Detected',
      {
        text: msg,
        list: containsNaNs.map((e) => `row ${e.row} column ${e.column}`),
      }
    ));
  }

  let outliers = checkOutliers(data, userVariables);
  if (outliers.length) {
    results.push(makeIssueList (
      severity.warning,
      'Possible Outliers',
      {
        text: 'Found possible data outliers (showing a maximum of 10 values)',
        list: outliers.map((e) => `Value ${e.value} in column ${e.column} row ${e.row}`),
      }
    ));
  }

  return results;
}

const auditFn = requireData (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
