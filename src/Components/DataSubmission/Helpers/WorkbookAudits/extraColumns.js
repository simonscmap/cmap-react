import auditFactory, {
  requireMetaAndVars,
  makeIssueList,
} from './auditFactory';
import severity from './severity';
import { orderedColumns } from '../../ValidationToolConstants';

const AUDIT_NAME = 'Extra Columns';
const DESCRIPTION =
  'Check metadata and variable sheets for non-prescribed column names';

const checkExtraColumns = (sheet, sheetName) => {
  if (!sheet || sheet.length < 1) {
    return;
  }

  const columnHeaders = Object.keys(sheet[0]);
  const approvedHeaders = orderedColumns[sheetName];

  if (!columnHeaders || !approvedHeaders) {
    return;
  }

  const nonMatchedHeaders = columnHeaders.filter(
    (header) => !approvedHeaders.includes(header),
  );
  if (nonMatchedHeaders.length) {
    return nonMatchedHeaders;
  }
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataset_meta_data, vars_meta_data } = standardAuditArgs;
  const results = [];

  // check
  const extraMetaColumns = checkExtraColumns(
    dataset_meta_data,
    'dataset_meta_data',
  );
  if (extraMetaColumns) {
    results.push(
      makeIssueList(severity.error, 'Extra Columns in Dataset Metadata Sheet', {
        text: `The following columns in the *\`dataset_meta_data\`* sheet have been added. Please use only the columns provided in the Data Submission Template.`,
        list: extraMetaColumns,
      }),
    );
  }

  const extraVarsColumns = checkExtraColumns(vars_meta_data, 'vars_meta_data');
  if (extraVarsColumns) {
    results.push(
      makeIssueList(
        severity.error,
        'Extra Columns in Variable Metadata Sheet',
        {
          text: `The following columns in the *\`var_meta_data\`* sheet have been added. Please use only the columns provided in the Data Submission Template.`,
          list: extraVarsColumns,
        },
      ),
    );
  }
  return results;
};

const auditFn = requireMetaAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
