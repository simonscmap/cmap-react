import auditFactory, {
  requireMetaAndVars,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Sample Rows';
const DESCRIPTION = 'Check metadata and variable sheets for sample rows from the submission template';

const datasetMetadataSampleRowValue =
  '< short name of your dataset (<50 chars) >';
const variableMetadataSampleRowValue = '< variable short name (<50 chars) >';


const datasetMetadataIncludesSampleRow = (datasetMetadata) => {
  if (!datasetMetadata || !datasetMetadata[0]) {
    return false;
  }
  for (let i = 0; i < datasetMetadata.length; i++) {
    if (
      typeof datasetMetadata[i]['dataset_short_name'] === 'string' &&
      datasetMetadata[i]['dataset_short_name'].includes(
        datasetMetadataSampleRowValue,
      )
    ) {
      return true;
    }
  }
  return false;
};

const variableMetadataIncludesSampleRow = (variableMetadata) => {
  for (let i = 0; i < variableMetadata.length; i++) {
    if (
      typeof variableMetadata[i]['var_short_name'] === 'string' &&
      variableMetadata[i]['var_short_name'].includes(
        variableMetadataSampleRowValue,
      )
    ) {
      return true;
    }
  }
  return false;
};


// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataset_meta_data, vars_meta_data } = standardAuditArgs;
  const results = []

  // check
  if (datasetMetadataIncludesSampleRow(dataset_meta_data)) {
    results.push(makeSimpleIssue (
      severity.error,
      'Metadata Worksheet Includes Sample from Submission Template',
      'The value "< short name of your dataset (<50 chars) >" was found in the `*dataset_short_name*` column of the `dataset_meta_data sheet`. Please delete the template sample row and resubmit your file.',
    ));
  }

  if (variableMetadataIncludesSampleRow(vars_meta_data)) {
    results.push(makeSimpleIssue (
      severity.error,
      'Variable Metadata Worksheet Includes Sample from Submission Template',
'The value "< variable short name (<50 chars) >" was found in the *`var_short_name column`* of the *`vars_meta_data sheet`*. Please delete the template sample row and resubmit your file.',
    ));
  }

  return results;
}

const auditFn = requireMetaAndVars (AUDIT_NAME, check);

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
