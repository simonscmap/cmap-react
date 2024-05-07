import auditFactory, {
  requireMeta,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Multi Cruise Format';
const DESCRIPTION = 'Check for multiple cruises in single cell';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataset_meta_data } = standardAuditArgs;
  const results = [];

  const multipleCruisesInOneCell = Boolean(
    typeof dataset_meta_data[0].cruise_names === 'string' &&
    dataset_meta_data[0].cruise_names.includes(',')
  );

  if (multipleCruisesInOneCell) {
    results.push(makeSimpleIssue (
      severity.warning,
      'Multiple Cuise Format',
      'The cruise_names column of the dataset_meta_data sheet may contain multiple cruises in one cell. Please separate cruise names beyond the first into separate rows in this column.'
    ));
  }

  return results;
}

const auditFn = requireMeta (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
