import mainAuditExecution from './WorkbookAudits/index';

export default (args) => {
  const { checkNameResult } = args;

  // if (!checkNameResult) {
  //   return { errors: [], warnings: [], first: [], confirmations: [] };
  // }

  const results = mainAuditExecution(args);
  return results;
};
