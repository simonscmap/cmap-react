import mainAuditExecution from './WorkbookAudits/index';

export default (args) => {
  const { checkNameResult } = args;
  console.log('🐛🐛🐛 workbookAudits.js:5 args:', args);
  if (!checkNameResult) {
    return { errors: [], warnings: [], first: [], confirmations: [] };
  }

  const results = mainAuditExecution(args);
  return results;
};
