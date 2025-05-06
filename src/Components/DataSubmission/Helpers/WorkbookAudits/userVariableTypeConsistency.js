import auditFactory, { requireData, makeIssueList } from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'User Vars Type Consistency';
const DESCRIPTION =
  'Check data for user defined variables for type consistency';

let checkTypeConsistency = (data, userVariables) => {
  // Look for mixture of strings and numbers
  let result = [];

  userVariables.forEach((e) => {
    let columnIsNumerical;
    for (let i = 0; i < data.length; i++) {
      if (columnIsNumerical === undefined) {
        if (data[i][e] || data[i][e] == 0) {
          columnIsNumerical = !isNaN(parseFloat(data[i][e]));
        }
      } else if (columnIsNumerical && (data[i][e] || data[i][e] == 0)) {
        if (isNaN(parseFloat(data[i][e]))) {
          result.push({ column: e, row: i + 2 });
          break;
        }
      } else if (data[i][e] || data[i][e] == 0) {
        if (!isNaN(parseFloat(data[i][e]))) {
          result.push({ column: e, row: i + 2 });
          break;
        }
      }
    }
  });

  return result;
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = [];

  let fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  let userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  const inconsistencies = checkTypeConsistency(data, userVariables);
  if (inconsistencies.length) {
    results.push(
      makeIssueList(severity.warning, 'Possible data type inconsistency', {
        text: 'Found rows with a mixture of string and numerical data',
        list: inconsistencies.map(
          (e) =>
            `Column ${e.column} contained a value of unexpected type in row ${e.row}`,
        ),
      }),
    );
  }

  return results;
};

const auditFn = requireData(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
