import auditFactory, {
  requireMetaAndVars,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Missing Cruise';
const DESCRIPTION =
  'Warn if make indicates cruise data but no cruise is recorded';

let checkMissingCruiseNames = (dataset_meta_data, vars_meta_data) => {
  if (!vars_meta_data || !dataset_meta_data) {
    return false;
  }
  let hasInSitu = vars_meta_data.some(
    (e) => e.var_sensor && e.var_sensor.toLowerCase() == 'in-situ',
  );
  let isObservation =
    dataset_meta_data[0].dataset_make &&
    dataset_meta_data[0].dataset_make.toLowerCase() == 'observation';
  let shouldHaveCruise = Boolean(hasInSitu && isObservation);
  let hasCruise = dataset_meta_data[0]['cruise_names'];
  return Boolean(shouldHaveCruise && !hasCruise);
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { dataset_meta_data, vars_meta_data } = standardAuditArgs;
  const results = [];

  if (checkMissingCruiseNames(dataset_meta_data, vars_meta_data)) {
    results.push(
      makeSimpleIssue(
        severity.warning,
        'Missing Cruise',
        'The supplied values for *make* and *sensor* suggest that some or all of your data may have been gathered on a scientific cruise, but no values were included for *`cruise_names`* in the *`dataset_meta_data sheet`*. Including cruise names will improve the discoverability of your data.',
      ),
    );
  }
  return results;
};

const auditFn = requireMetaAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
