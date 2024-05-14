import auditFactory, {
  requireData,
  makeIssueList,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Identical Values';
const DESCRIPTION = 'Check if any user defined varibles have all identical values';

const colHasAllIdenticalValues = (data, col) => {
  if (data.length < 2) {
    return false; // if data is only 1 row, we don't need a uniqueness check
  }
  let sampleValue;
  let i = 0;

  while (sampleValue === undefined && i < data.length) {
    if (data[i][col] || data[i][col] == 0) {
      sampleValue = data[i][col];
    }
    i++;
  }

  for (let j = i; j < data.length; j++) {
    if (data[j][col] != sampleValue) {
      return false;
    }
  }

  return true;
};


const checkAllSameValue = (data, userVariables) => {
  let result = [];

  userVariables.forEach((varName) => {
    let allSame = colHasAllIdenticalValues (data, varName);
    if (allSame) {
      result.push(varName);
    }
  });

  return result;
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = []

  const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  const userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  const colsWithSameValue = checkAllSameValue(data, userVariables);

  if (colsWithSameValue.length) {
    results.push(makeIssueList (
      severity.warning,
      'All Values for Column Are Identical',
      {
        text: 'The following columns had all identical values',
        list: colsWithSameValue,
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
