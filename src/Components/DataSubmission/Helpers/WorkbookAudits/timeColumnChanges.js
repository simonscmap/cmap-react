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
  NONE: 'No conversion was needed',
  EXCEL_TO_UTC: 'Excel numeric date format was converted to UTC ISO format',
  STRING_NO_TZ_TO_UTC:
    'String time without timezone information was converted to UTC',
  STRING_NON_UTC_TO_UTC:
    'String time with non-UTC timezone was converted to UTC',
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataChanges } = standardAuditArgs;
  const results = [];
  // Check if any conversion type other than NONE exists
  const hasActualConversions = dataChanges.some(
    (change) => change && change.timeConversionType !== 'NONE',
  );

  if (!dataChanges || dataChanges.length === 0 || !hasActualConversions) {
    return results;
  }

  // Count different types of conversions
  const changedRows = [];

  dataChanges.forEach((change, index) => {
    if (!change) {
      return;
    }

    const { timeConversionType, prevValue, newValue } = change;
    // Only collect details for rows that had actual conversion (not NONE)
    if (timeConversionType !== 'NONE') {
      changedRows.push({
        row: index + 2, // match row number in data sheet
        conversionType: timeConversionType,
        prevValue: String(prevValue),
        newValue: String(newValue),
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
        summary: `${changedRows.length} rows had time format conversions applied.`,
        changes: changedRows,
        descriptions: CONVERSION_DESCRIPTIONS,
      },
    ),
  );

  return results;
};

const auditFn = requireDataAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
