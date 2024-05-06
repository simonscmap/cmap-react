import mainAuditExecution from './WorkbookAudits/index';

export default (args) => {
  const {
    checkNameResult,
    submissionType,
  } = args;


  if (!checkNameResult) {
    return { errors: [], warnings: [], first: [], confirmations: [] };
  }

  console.log ('workbook audit called', submissionType, checkNameResult);

  const results = mainAuditExecution (args);
  return results;

};
