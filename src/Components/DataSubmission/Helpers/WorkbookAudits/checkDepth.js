import auditFactory, { requireData, makeSimpleIssue } from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Depth';
const DESCRIPTION = 'Check a depth value exists for every row';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;
  const results = [];

  const hasData = (rowN) => {
    return Boolean(data[rowN].depth || data[rowN].depth == 0);
  };

  const firstRow = hasData(0);

  let err = false;
  let errRow = null;

  for (let i = 0; i < data.length; i++) {
    if (firstRow != hasData(i)) {
      err = true;
      errRow = i;
      break;
    }
  }

  if (err) {
    let message =
      'If your data includes depth, it must have a depth value for every row. Othewise all depth values must be empty.';
    if (errRow !== null) {
      message += `An inconsistency was first detected at row ${errRow}`;
    }

    results.push(
      makeSimpleIssue(
        severity.error,
        'Depth Values Must Be Consistent',
        message,
      ),
    );
  }

  return results;
};

const auditFn = requireData(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
