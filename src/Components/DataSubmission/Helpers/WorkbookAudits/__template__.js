import auditFactory from './auditFactory';
// import IssueWithList from '../IssueWithList';
// import severity from './severity';

const AUDIT_NAME = '';
const DESCRIPTION = '';

// Result1 :: { severity, title, detail }
// Result2 :: { severity, title, Component, args }
// -- args for IssueWithList :: { text, list }
// Result3 :: { severity, title, body }
// -- body :: { content, links }


// :: args -> [result]
const auditFn = (args) => {
  const results = []

  // check

  return results;
}

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
