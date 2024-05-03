import severity from './severity';
import orphanedCellsAudit from './orphanedCellsAudit';
import checkNamingConflicts from './checkNamingConflicts';
import checkSheetsAudit from './checkSheetsAudit';
import duplicateDataAudit from './dataSheetAudit';

const audits = [
  orphanedCellsAudit,
  checkNamingConflicts,
  checkSheetsAudit,
  duplicateDataAudit
];

/*
   standard arguments object:

    workbook, // workboork is the file prior to conversion by sheetjs to json
    data, // the data sheet
    dataset_meta_data,  // the metadata sheet
    vars_meta_data, // the vars metadata sheet
    userDataSubmissions,

    // time formatting flags
    is1904,
    numericDateFormatConverted,

    // check name
    checkNameResult,
    submissionType,
    submissionToUpdate,
 */

const compileResults = (results) => {
  const report = {
    errors: [],
    warnings: [],
    confirmations: [],
    first: [],
  };

  results.forEach ((r) => {
    switch (r.severity) {
      case severity.error:
        report.errors.push (r);
        return;
      case severity.warning:
        report.warnings.push (r);
        return;
      case severity.confirmation:
        report.confirmations.push (r);
        return;
      default:
        report.warnings.push (r);
        return;
    }
  });

  return report;
}

const reportTime = (audits, times, elapsed) => {
  const report = audits.map ((a, i) => ({
    name: a.name,
    share: times[i] / elapsed,
    duration: times[i],
  })).sort ((a, b) => {
    if (a.share > b.share) {
      return -1;
    } else if (a.share < b.share) {
      return 1
    } else {
      return 0;
    }
  });

  console.table (report);
};

const mainAuditExecution = (args) => {


  const results = [];
  const times = [];

  const overallStartTime = Date.now();

  // iterate over audits, collecting results
  audits.forEach ((audit, i) => {
    const { name, description, fn } = audit;
    console.log (`[${i + 1}/${audits.length}] Audit: `, `"${name}"`, description);
    const timeStart = Date.now();

    let result = [];
    if (fn && fn.call) {
      result = fn.call (null, args);
    }
    if (Array.isArray(result)) {
      results.concat(...result);
    }
    const elapsedTime = Date.now() - timeStart;
    console.log (`------ ${elapsedTime} ms`)
    times.push (elapsedTime);
  });

  const overallElapsedTime = Date.now() - overallStartTime;


  reportTime (audits, times, overallElapsedTime);

  return compileResults (results);
};

export default mainAuditExecution;
