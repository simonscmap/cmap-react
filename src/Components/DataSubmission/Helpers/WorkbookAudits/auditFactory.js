import IssueWithList from '../IssueWithList';

// basic contract
export default function (name, description, fn) {
  return {
    name,
    description,
    fn,
  };
}

// args check wrappers

export const guardByPredicate =
  (auditName, auditFn, preds) => (standardAuditArgs) => {
    if (!standardAuditArgs) {
      console.log(`${auditName} did not run because it received no arguments`);
      return [];
    }

    let shouldProceedToValidation = true;
    preds.forEach((p) => {
      const pass = p.call(null, standardAuditArgs);
      if (!pass) {
        console.log(
          `${auditName} did not run because it did not receive required data or that data lacked expected properties.`,
        );
        shouldProceedToValidation = false;
      }
    });

    if (!shouldProceedToValidation) {
      console.log(`declining to run audit ${auditName}`);
      return [];
    } else {
      const auditResult = auditFn.call(null, standardAuditArgs);
      return auditResult;
    }
  };

export const requireFields =
  (auditName, auditFn, fields) => (standardAuditArgs) => {
    const predicates = fields.map((f) => (args_) => !!args_[f]);
    return guardByPredicate(auditName, auditFn, predicates)(standardAuditArgs);
  };

export const requireWorkbookArg = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['workbook']);
export const requireData = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['data']);
export const requireVars = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['vars_meta_data']);
export const requireMeta = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['dataset_meta_data']);

export const requireDataAndVars = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['data', 'vars_meta_data']);
export const requireMetaAndVars = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['dataset_meta_data', 'vars_meta_data']);

export const requireCheckNameResult = (auditName, auditFn) =>
  requireFields(auditName, auditFn, ['checkNameResult']);

export const requireWorkbookAndDataSheet = (auditName, auditFn) => {
  const predicates = [
    (args_) => !!args_.workbook,
    (args_) => Array.isArray(args_.data) && args_.data.length > 0,
  ];
  return guardByPredicate(auditName, auditFn, predicates); // returns a fn
};

// issue generators

export const makeSimpleIssue = (severity, title, detail) => ({
  severity,
  title,
  detail,
});

export const makeIssueWithCustomComponent = (
  severity,
  title,
  component,
  args,
) => ({
  severity,
  title,
  Component: component,
  args,
});

export const makeIssueList = (severity, title, args) => ({
  severity,
  title,
  Component: IssueWithList,
  args,
});

export const makeIssueWithBody = (severity, title, body) => ({
  severity,
  title,
  body,
});
