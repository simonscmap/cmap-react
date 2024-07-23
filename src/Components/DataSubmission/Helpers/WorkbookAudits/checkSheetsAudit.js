import auditFactory, { requireWorkbookArg } from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Required Worksheets';
const DESCRIPTION = 'Check required worksheets exist and are not empty';

let checkAllSheetsExist = (workbook) => {
  let expected = ['data', 'vars_meta_data', 'dataset_meta_data'];
  return expected.filter ((e) => !workbook.Sheets[e]);
};

let checkAllSheetsHaveData = (workbook) => {
  let expected = ['data', 'vars_meta_data', 'dataset_meta_data'];
  return expected.filter ((e) => workbook.Sheets[e].length === 0);
};

// Result1 :: { severity, title, detail }
// Result2 :: { severity, title, Component, args }
// -- args for IssueWithList :: { text, list }
// Result3 :: { severity, title, body }
// -- body :: { content, links }

// :: args -> [result]
const auditFn = (standardArgs) => {
  const { workbook } = standardArgs;

  const results = []

  // check
  let sheetCheck = checkAllSheetsExist(workbook);

  if (sheetCheck.length) {
    const inflect = (sheetCheck.length > 1 ? 's' : '');
    const wrapInPreQuotes = (s) => `*\`${s}\`*`;
    const stringOfSheetNames = sheetCheck.map(wrapInPreQuotes).join (', ');
    results.push({
      severity: severity.error,
      title: 'Workbook is missing worksheet' + inflect,
      body: {
        content: `Workbook is missing required sheet ${inflect}: ${stringOfSheetNames}. Please add worksheet${inflect} and {0}.`,
        links: [{
          text: 'resubmit',
          url: '/datasubmission/submission-portal#step0'
        }]
      }
    });
  }

  const notEmptyCheck = checkAllSheetsHaveData (workbook);

  if (notEmptyCheck.length) {
    const inflect = (notEmptyCheck.length > 1 ? 's' : '');
    const wrapInPreQuotes = (s) => `*\`${s}\`*`;
    const stringOfSheetNames = notEmptyCheck.map(wrapInPreQuotes).join (', ');
    results.push({
      severity: severity.error,
      title: `Worksheet${inflect} are empty`,
      body: {
        content: `Some worksheets are missing data. Please check the ${stringOfSheetNames} worksheet${inflect} and {0}.`,
        links: [{
          text: 'resubmit',
          url: '/datasubmission/submission-portal#step0'
        }]
      }
    });
  }

  return results;
}

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  requireWorkbookArg (AUDIT_NAME, auditFn),
);

export default audit;
