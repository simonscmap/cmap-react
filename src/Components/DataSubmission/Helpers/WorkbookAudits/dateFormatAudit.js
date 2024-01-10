import auditFactory, {
  makeSimpleIssue,
  requireWorkbookAndDataSheet,
} from './auditFactory';
// import IssueWithList from '../IssueWithList';
import severity from './severity';

import {
  isValidDateString,
  isValidDateTimeString,
  validateTimeValues,
} from '../workbookAuditLib/time';


const AUDIT_NAME = 'Data Sheet Time Values';
const DESCRIPTION = 'Check time values are valid';

let is1904Format = (workbook) => {
  return Boolean(((workbook.Workbook || {}).WBProps || {}).date1904);
}

const checkTypeConsistencyOfTimeValues = (data) => {
  if (!data || !Array.isArray(data)) {
    return true;
  }
  let isConsistent = true;
  let lastType = typeof data[0].time;
  let strLen = lastType === 'string' ? data[0].time.length : 0;
  for (let k = 1; k < data.length; k++) {
    if (typeof data[k].time !== lastType) {
      isConsistent = false;
      break;
    }
    if (lastType === 'string') {
      if (data[k].time.length !== strLen) {
        // need a better check: 2015/1/15 vs 2015/10/30
        // isConsistent = false;
      }
    }
  }
  return isConsistent;
}


const checkDateFormat = (standardArgs ) => {
  const {
    data,
    is1904,
    numericDateFormatConverted
  } = standardArgs;

  const results = []

  // first check that there are time values, if not, don't run other tests
  if (!data || !Array.isArray(data) || data[0].time === undefined) {
    results.push (makeSimpleIssue (
      severity.error,
      'Missing Time Values',
      'There are rows in the data sheet without a time value. Please check you data and resubmit.'
    ));
    // return early;
    return results;
  }


  const {
    negativeNumberDate,
    integerDate,
    missingDate,
  } = validateTimeValues (data);

  // MARK
  if (is1904) {
    return {
      error: {
        title: 'Time Format Error: Unsupported Excel 1904 Format',
        body: {
          content:`The submitted file uses Date1904 formatting for time values. Please convert to normal excel format, and verify values are accurate. For more information about Date1904 please see the {0}.`,
          links: [{
            text: 'Excel documentation',
            url: 'https://learn.microsoft.com/en-us/office/troubleshoot/excel/1900-and-1904-date-system',
          }]
        }
      }
    }
  }

  if (integerDate) {
    return {
      error: {
        title: 'Time Format Error: Integer Values',
        body: {
          content: `The submitted file uses numeric integer values in the time field. This format is invalid. Please convert your time values to string values according to the {0}.`,
          links: [{
            text: 'Submission Guide',
            url: '/datasubmission/guide',
          }]
        }
      },
    }
  }

  if (negativeNumberDate) {
    return {
      error: {
        title: 'Time Format Error: Negative Values',
        body: {
          content: `The submitted file uses numeric values in the time field, and some values are negative numbers. Please convert your date values to string values according to the {0} and resubmit.`,
          links: [{
            text: 'Submission Guide',
            url: '/datasubmission/guide',
          }]
        }
      },
    }
  }

  if (numericDateFormatConverted) {
    return {
      warning:{
        title: 'Data Conversion Warning',
        body: {
          content: `The submitted file uses numeric decimal values for date-times. These have been converted to string values with the assumption that they are Excel format date times. Please examine them for accuracy in the next validation step. If the converted dates are not accurate, modify your submission file and upload it again.`,
        }
      },
    }
  }

  if (missingDate) {
    return {
      error: {
        title: 'Missing Time Data',
        body: {
          content: `Some rows do not have a time value. Please ensure that all rows have required data and resubmit. The {0} details required values and formats.`,
          links: [{
            text: 'Submission Guide',
            url: '/datasubmission/guide',
          }]
        }
      },
    }
  }

  // check valid string

  const allTimesAreValidStrings = data.every (row => {
    const t = row.time;
    return isValidDateString (t) || isValidDateTimeString(t);
  });

  if (!allTimesAreValidStrings) {
    return {
      error: `Some times are not in valid format. Please check your data and ensure that all time values are consistently formatted according to the Submission Guide.`,
    }
  }

  const timeValuesAreConsistent = checkTypeConsistencyOfTimeValues (data);
  if (!timeValuesAreConsistent) {
    return {
      error: {
        title: 'Time Values Are Different Types',
        detail: 'Time values in the data sheet are not all the same type. Please check your data sheet to ensure all dates are of the same type and format.'
      }
    };
  }

  // check consistency

  return;
};

// :: args -> [result]
const auditFn = (args) => {
  const results = []


    // const check1904DateFormat = is1904Format (workbook);
    // if (check1904DateFormat) {
    //   warnings.push (messages.is1904Error)
    // }

  return results;
}

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn,
);

export default audit;
