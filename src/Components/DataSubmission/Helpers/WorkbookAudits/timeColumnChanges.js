import auditFactory, {
  requireDataAndVars,
  makeIssueWithCustomComponent,
} from './auditFactory';
import severity from './severity';
import TimeChangesTable from './TimeChangesTable';
import { groupTimeChangesByConversionType } from '../formatDataSheet';

const AUDIT_NAME = 'Time Column Changes';
const DESCRIPTION = 'Report changes made to the time column';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataChanges } = standardAuditArgs;
  const results = [];

  if (!dataChanges || dataChanges.length === 0) {
    return results;
  }

  // Process the changes using the shared utility
  const exampleChanges = groupTimeChangesByConversionType(dataChanges);
  console.log('🐛🐛🐛 timeColumnChanges.js:23 exampleChanges:', exampleChanges);
  // Use the custom table component to display the changes
  results.push(
    makeIssueWithCustomComponent(
      severity.confirmation,
      'Time Column Changes',
      TimeChangesTable,
      {
        summary: `${dataChanges.length} rows had time format conversions applied.`,
        note: 'Showing one example of each conversion type:',
        changes: exampleChanges,
      },
    ),
  );

  return results;
};

const auditFn = requireDataAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
