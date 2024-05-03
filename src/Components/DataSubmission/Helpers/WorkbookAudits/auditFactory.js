// basic contract
export default function (name, description, fn) {
  return {
    name,
    description,
    fn,
  }
}

// args check wrappers

export const guardByPredicate = (auditName, auditFn, preds) =>
  (standardAuditArgs) => {
    if (!standardAuditArgs) {
      console.log (`${auditName} did not run because it received no arguments`);
      return [];
    }

    let shouldProceedToValidation = true;
    preds.forEach ((p) => {
      const pass = p.call (null, standardAuditArgs);
      if (!pass) {
        console.log (`${auditName} did not run because it did not receive required data or that data lacked expected properties.`);
        shouldProceedToValidation = false;
      }
    });

    if (!shouldProceedToValidation) {
      return [];
    } else {
      return auditFn.call (null, standardAuditArgs);
    }
  };


export const requireFields = (auditName, auditFn, fields) =>
  (standardAuditArgs) => {
    const predicates = fields.map((f) => (args_) => !!args_[f]);
    guardByPredicate (auditName, auditFn, predicates) (standardAuditArgs);
  };


export const requireWorkbookArg = (auditName, auditFn) => requireFields (auditName, auditFn, ['workbook']);
export const requireCheckNameResult = (auditName, auditFn) => requireFields (auditName, auditFn, ['checkNameResult']);

export const requireWorkbookAndDataSheet = (auditName, auditFn) => {
  const predicates = [
    (args_) => !!args_.workbook,
    (args_) => Array.isArray(args_.data) && args_.data.length > 0,
  ];
  return guardByPredicate (auditName, auditFn, predicates); // returns a fn
}

// issue generators

export const makeSimpleIssue = (severity, title, detail) => ({
  severity,
  title,
  detail,
});

export const makeIssueWithCustomComponent = (severity, title, component, args) => ({
  severity,
  title,
  Component: component,
  args,
});

export const makeIssueWithBody = (severity, title, body) => ({
  severity,
  title,
  body,
});
