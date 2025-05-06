import auditFactory, {
  requireWorkbookAndDataSheet,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Required Data Columns';
const DESCRIPTION = 'Check data worksheet for required columns';

// :: args -> [result]
const checkRequiredCols = (standardAuditArgs) => {
  const { data } = standardAuditArgs;

  let missingCols = [];
  let sample = data[0];

  ['time', 'lat', 'lon'].forEach((e) => {
    if (!sample[e] && sample[e] !== 0) {
      missingCols.push(e);
    }
  });

  const results = [];
  if (missingCols.length) {
    results.push(
      makeSimpleIssue(
        severity.error,
        'Data sheet is missing required columns',
        `The data sheet is missing the following required columns: ${missingCols.join(', ')}. Please correct the submission file and resubmit.`,
      ),
    );
  }

  return results;
};

const auditFn = requireWorkbookAndDataSheet(AUDIT_NAME, checkRequiredCols);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
