import auditFactory, {
  requireDataAndVars,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Time Column Changes';
const DESCRIPTION = 'Report changes made to the time column';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataChanges } = standardAuditArgs;
  const results = [];
  console.log('🐛🐛🐛 timeColumnChanges.js:14 dataChanges:', dataChanges);
  if (dataChanges) {
    results.push(
      makeSimpleIssue(
        severity.confirmation,
        'Time Column Changes',
        `Changes made to time column: ${JSON.stringify(dataChanges)}`,
      ),
    );
  } else {
    results.push(
      makeSimpleIssue(
        severity.confirmation,
        'No Time Column Changes',
        'No changes were made to the time column.',
      ),
    );
  }

  return results;
};

const auditFn = requireDataAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
