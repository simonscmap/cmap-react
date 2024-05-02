// basic contract
export default function (name, description, fn) {
  return {
    name,
    description,
    fn,
  }
}

// args check wrappers

export const requireWorkbookArg = (auditName, auditFn) =>
  (standardAuditArgs) => {
    if (!standardAuditArgs) {
      console.log (`${auditName} did not run because it received no arguments`);
      return [];
    }

    const { workbook } = standardAuditArgs;

    if (!workbook) {
      console.log (`${auditName} did not run because it did not receive a workbook to analyze`);
      return [];
    }

    return auditFn.call (null, standardAuditArgs);
  }


// make issue
