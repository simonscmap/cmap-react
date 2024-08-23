import auditFactory, {
  requireDataAndVars,
  makeIssueList,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Variable Names';
const DESCRIPTION = 'Check user defined variables have matching column in data sheet';

const wrapInQuotes = name => `"${name}"`;

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data, vars_meta_data } = standardAuditArgs;
  const results = [];

  const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  const userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  // console.log ('user variables', userVariables);

  const varsShortNames = vars_meta_data.map((e) => e.var_short_name);

  // console.log ('var names', varsShortNames)
  const unmatchedShortNames = varsShortNames
    .filter((e) => !userVariables.has(e));

  const colsWithoutVarDefs = Array.from(userVariables).filter ((c) => !varsShortNames.includes(c));

  const dataCols = userVariables.size;
  const definedVars = vars_meta_data.length;


  if (unmatchedShortNames.length) {
    results.push (makeIssueList (
      severity.error,
      'Variable Short Name Has to Match Data Column',
      {
        text: `The following values for *\`var_short_name\`* in the *\`vars_meta_data\`* sheet did not match any column header on the data sheet:`,
        list: unmatchedShortNames.map (wrapInQuotes),
      }
    ));
  }

  if (colsWithoutVarDefs.length) {
    results.push (makeIssueList (
      severity.error,
      'Unidentified Columns in the Data Sheet',
      {
        text: `The following columns in the *\`data\`* sheet are not defined in the *\`vars_meta_data\`* sheet:`,
        list: colsWithoutVarDefs.map (wrapInQuotes),
      }
    ));
  }

  if (dataCols !== definedVars) {
    results.push (makeSimpleIssue (
      severity.error,
      'Inequal Number of Data Columns and Variable Definitions',
      `There are ${dataCols} custom data columns in the *\`data sheet\`*, but ${definedVars} variables defined in the *\`vars_meta_data\`* sheet.`
    ))
  }

  return results;
}

const auditFn = requireDataAndVars (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
