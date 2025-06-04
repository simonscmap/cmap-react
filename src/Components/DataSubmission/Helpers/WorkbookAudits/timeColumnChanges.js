import auditFactory, {
  requireDataAndVars,
  makeIssueWithCustomComponent,
} from './auditFactory';
import severity from './severity';
import TimeChangesTable from './TimeChangesTable';

const AUDIT_NAME = 'Time Column Changes';
const DESCRIPTION = 'Report changes made to the time column';

// Descriptions for each conversion type
const CONVERSION_DESCRIPTIONS = {
  EXCEL_TO_UTC:
    'Excel numeric date format does not include timezone information, assumed to be UTC',
  STRING_NO_TZ_TO_UTC:
    'String time without timezone information assumed to be UTC',
  STRING_NON_UTC_TO_UTC:
    'String time with non-UTC timezone was converted to UTC',
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataChanges } = standardAuditArgs;
  const results = [];

  if (!dataChanges || dataChanges.length === 0) {
    return results;
  }

  // Track conversion types we've already seen
  const seenConversionTypes = new Set();
  const exampleChanges = [];

  // Process the changes - only keep one example of each conversion type
  dataChanges.forEach((change) => {
    if (!seenConversionTypes.has(change.timeConversionType)) {
      seenConversionTypes.add(change.timeConversionType);
      exampleChanges.push({
        row: change.rowIndex + 2, // match row number in data sheet (1-indexed for display)
        conversionType: change.timeConversionType,
        prevValue: String(change.prevValue),
        newValue: String(change.newValue),
      });
    }
  });

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
        descriptions: CONVERSION_DESCRIPTIONS,
      },
    ),
  );

  return results;
};

const auditFn = requireDataAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
