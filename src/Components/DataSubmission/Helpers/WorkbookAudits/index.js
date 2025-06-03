import severity from './severity';
import orphanedCellsAudit from './orphanedCellsAudit';
import checkNamingConflicts from './checkNamingConflicts';
import checkSheetsAudit from './checkSheetsAudit';
import duplicateDataAudit from './dataSheetAudit';
import checkRequiredDataCols from './checkRequiredColumns';
import auditVarNames from './auditVarNames';
import checkEmptyDataCols from './checkEmptyDataCols';
import checkDepth from './checkDepth';
import noRadians from './noRadians';
import uniqueSpaceTime from './uniqueSpaceTime';
import typeConsistency from './userVariableTypeConsistency';
import uniformValues from './uniformValuesCheck';
import NaNAndOutliers from './checkNaNsAndOutliers';
import checkDuplicateRows from './duplicateRows';
import checkSampleRows from './checkSampleRows';
import multiCruiseFormat from './multipleCruisesFormat';
import extraColumns from './extraColumns';
import checkDuplicateVarNames from './checkDuplicateVarNames';
import missingCruise from './missingCruise';
import timeColumnChanges from './timeColumnChanges';

import { formatEvent } from '../../../../Utility/debugTimer';

const audits = [
  orphanedCellsAudit,
  checkNamingConflicts,
  checkSheetsAudit,
  duplicateDataAudit,
  checkRequiredDataCols,
  auditVarNames,
  checkEmptyDataCols,
  checkDepth,
  noRadians,
  uniqueSpaceTime,
  typeConsistency,
  uniformValues,
  NaNAndOutliers,
  checkDuplicateRows,
  checkSampleRows,
  multiCruiseFormat,
  extraColumns,
  checkDuplicateVarNames,
  missingCruise,
  timeColumnChanges,
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

  results.forEach((r) => {
    switch (r.severity) {
      case severity.error:
        report.errors.push(r);
        return;
      case severity.warning:
        report.warnings.push(r);
        return;
      case severity.confirmation:
        report.confirmations.push(r);
        return;
      default:
        report.warnings.push(r);
        return;
    }
  });

  // console.log ('compiled workbook audit', results, report);

  return report;
};

const reportTime = (auditTimes, times, elapsed) => {
  const report = auditTimes
    .map((a, i) => ({
      tag: a.name,
      share: times[i] / elapsed,
      duration: times[i],
    }))
    .sort((a, b) => {
      if (a.share > b.share) {
        return -1;
      } else if (a.share < b.share) {
        return 1;
      } else {
        return 0;
      }
    })
    .map(formatEvent);

  console.log("Workbook Audits' Profile:");
  console.table(report);
};

const mainAuditExecution = (args) => {
  let results = [];
  const times = [];

  const overallStartTime = Date.now();

  // iterate over audits, collecting results
  audits.forEach((audit, i) => {
    const { name, description, fn } = audit;
    const timeStart = Date.now();

    let auditResult;
    if (fn && fn.call) {
      auditResult = fn.call(null, args);
    }

    if (Array.isArray(auditResult)) {
      results = results.concat(...auditResult);
    } else {
      // console.log (`${name} gave no result`)
    }
    const elapsedTime = Date.now() - timeStart;
    times.push(elapsedTime);
  });

  const overallElapsedTime = Date.now() - overallStartTime;

  reportTime(audits, times, overallElapsedTime);
  const compiledResults = compileResults(results);
  return compiledResults;
};

export default mainAuditExecution;
