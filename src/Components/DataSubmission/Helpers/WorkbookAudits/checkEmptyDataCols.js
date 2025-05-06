import auditFactory, {
  requireWorkbookAndDataSheet,
  makeIssueList,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Empty Data Columns';
const DESCRIPTION = 'Check data sheet for columns with no data';

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data } = standardAuditArgs;

  const results = [];

  const fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  const userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  const emptyColumns = [];
  userVariables.forEach((header) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][header] || data[i][header] === 0) {
        return;
      }
    }
    emptyColumns.push(header);
  });

  // check

  if (emptyColumns.length) {
    results.push(
      makeIssueList(severity.error, 'Data Columns Without Any Values', {
        text: 'The following columns contain no values.',
        list: emptyColumns,
      }),
    );
  }

  return results;
};

const auditFn = requireWorkbookAndDataSheet(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
