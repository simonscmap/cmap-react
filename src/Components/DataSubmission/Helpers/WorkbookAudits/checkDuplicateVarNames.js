import auditFactory, {
  requireVars,
  makeIssueList,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Duplicate Var Names';
const DESCRIPTION = 'Check the vars sheet for duplicate short/long names';

const findDuplicateValuesInArray = (arr) => {
  const sorted = arr.slice().sort(); // now identical values will be adjacent
  let results = {};
  for (let k = 0; k < sorted.length - 1; k++) {
    if (sorted[k + 1] == sorted[k]) {
      if (!results[sorted[k]]) {
        results[sorted[k]] = true;
      }
    }
  }
  return Object.keys(results);
};

const checkValuesAreUnique = (sheet, header) => {
  if (!sheet || !Array.isArray(sheet)) {
    return;
  }
  if (!header) {
    return;
  }

  const columnValues = sheet.map ((row) => row[header]);
  const duplicateValues = findDuplicateValuesInArray (columnValues);

  return duplicateValues;
}


// :: args -> [result]
const check = (standardAuditArgs) => {
  const { vars_meta_data } = standardAuditArgs;
  const results = [];

  const duplicateShortNames = checkValuesAreUnique (vars_meta_data, 'var_short_name');
  if (duplicateShortNames && duplicateShortNames.length) {
    results.push (makeIssueList(
      severity.error,
      'Duplicate Variable Short Names',
      {
        text: `*\`var_short_name\`*s must be unique. The following *\`var_short_name\`* values are repeated in the *\`vars_meta_data\`* sheet. :`,
        list: duplicateShortNames,
      }
    ));
  }

  const duplicateLongNames = checkValuesAreUnique (vars_meta_data, 'var_long_name');
  if (duplicateLongNames && duplicateLongNames.length) {
    results.push (makeIssueList(
      severity.error,
      'Duplicate Variable Long Names',
      {
        text: `*\`var_long_name\`*s must be unique. The following *\`var_long_name\`* values are repeated in the *\`vars_meta_data\`* sheet. :`,
        list: duplicateLongNames,
      }
    ));
  }
  return results;
}

const auditFn = requireVars (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
