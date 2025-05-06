import auditFactory from // requireDataAndVars,
// makeSimpleIssue,
'./auditFactory';
// import IssueWithList from '../IssueWithList';
// import severity from './severity';

const AUDIT_NAME = '';
const DESCRIPTION = '';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const {} = standardAuditArgs;
  const results = [];

  // check

  return results;
};

const auditFn = check;

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
