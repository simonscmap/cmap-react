import auditFactory, {
  requireDataAndVars,
  makeIssueList,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Variable Names';
const DESCRIPTION = 'Check used defined variables have matching column in data sheet';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data, vars_meta_data } = standardAuditArgs;
  const results = [];

  const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  const userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  const varsShortNames = vars_meta_data.map((e) => e.var_short_name);
  const unmatchedShortNames = varsShortNames
    .filter((e) => !userVariables.has(e));

  if (unmatchedShortNames.length) {
    results.push (makeIssueList (
      severity.error,
      'Variable Short Name Has to Matching Data Column',
      {
        text: `The following values for *\`var_short_name\`* in the *\`vars_meta_data\`* sheet did not match any column header on the data sheet:`,
        list: unmatchedShortNames,
      }
    ));
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
