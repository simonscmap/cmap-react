import auditFactory, {
  requireDataAndVars,
  makeIssueList,
  makeSimpleIssue,
} from './auditFactory';
import severity from './severity';

const AUDIT_NAME = 'Duplicate Rows';
const DESCRIPTION = 'Check data sheet for duplicate rows';

export const checkNoDuplicateRows = (sheet) => {
  const columnHeaders = Object.keys(sheet[0]);

  const rowsAreSame = (a, b) => {
    return columnHeaders.every((headerKey) => a[headerKey] === b[headerKey]);
  };

  const result = sheet.reduce((results, currentRow, index, arr) => {
    // as reduce advances down the rows, we don't need to compare to rows we've already checked
    // get a slice of the array from the current index,
    // compare current row with all rows in that slice
    if (index === arr.length - 1) {
      return results; // end
    }
    const rowsToCompare = arr.slice(index + 1);

    const identicalRows = rowsToCompare.reduce(
      (identicalIndexes, currentComparison, sliceIndex) => {
        if (rowsAreSame(currentRow, currentComparison)) {
          return identicalIndexes.concat(1 + index + sliceIndex);
        } else {
          return identicalIndexes;
        }
      },
      [],
    );

    if (identicalRows.length) {
      results.push([index, identicalRows]); // keep result in the form of an entry
    }

    return results;
  }, []);

  // emend results

  const rowIndexesWithDuplicates = result.map((entry) => entry[0]);
  const finalResult = result.map((entry) => {
    const targetRowIndex = entry[0]; // :: Integer // this is the index we are testing
    // do prior entries contain this one as a duplicate?
    const priorSlice = result.slice(0, targetRowIndex);
    const priorMatches = priorSlice
      .filter((priorEntry) => priorEntry[1].includes(targetRowIndex)) // narrow to entries that mark current as a duplicate
      .map((matchingEntry) => matchingEntry[0]); // get matching index
    return [targetRowIndex, entry[1].concat(priorMatches).sort()]; // return emended entry
  });

  return {
    rowIndexesWithDuplicates,
    result: finalResult,
  };
};

// :: args -> [result]
const check = (standardAuditArgs) => {
  const { data, vars_meta_data } = standardAuditArgs;
  const results = [];

  // check data sheet

  if (data.length < 10000) {
    const { rowIndexesWithDuplicates, result } = checkNoDuplicateRows(data);
    if (rowIndexesWithDuplicates.length) {
      results.push(
        makeIssueList(severity.error, 'Repeated Rows in Data Sheet', {
          text: `The following ${result.length} row(s) of the data sheet are repeated (all values, for every column, are the same):`,
          list: result.map(
            (r) => `${r[0]} is repeated in rows ${r[1].join(', ')}`,
          ),
        }),
      );
    }
  } else {
    results.push(
      makeSimpleIssue(
        severity.confirmation,
        'Did Not Check For Duplicate Rows',
        `Please note that because the dataset is large, the validator did not check for the existence of repeated rows.`,
      ),
    );
  }

  // check vars metadata sheet

  const { rowIndexesWithDuplicates, result } =
    checkNoDuplicateRows(vars_meta_data);
  if (rowIndexesWithDuplicates.length) {
    results.push(
      makeIssueList(
        severity.error,
        'Repeated Rows in Variable Metadata Sheet',
        {
          text: `The following ${result.length} row(s) of the *\`vars_meta_data\`* sheet are repeated (all values, for every column, are the same):`,
          list: result.map(
            (r) => `row ${r[0]} is repeated in row(s) ${r[1].join(', ')}`,
          ),
        },
      ),
    );
  }

  return results;
};

const auditFn = requireDataAndVars(AUDIT_NAME, check);

const audit = auditFactory(AUDIT_NAME, DESCRIPTION, auditFn);

export default audit;
