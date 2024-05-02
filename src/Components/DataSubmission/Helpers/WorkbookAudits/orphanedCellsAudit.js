import auditFactory, { requireWorkbookArg } from './auditFactory';
import IssueWithList from '../IssueWithList';
import severity from './severity';

const AUDIT_NAME = 'Orphaned Cells';
const DESCRIPTION = 'Check for orphaned cells';

// 'A1', 'J23', 'QQ4' ...
// -> ['A', 1], ['J', 23], ['QQ', 4]
const splitKey = (key) => {
  let indexOfRowNumber;
  for (let k = 1; k < key.length; k++) { // start at 1 because first char is always a letter
    const char = key[k];
    const asInt = parseInt (char, 10);
    if (!isNaN (asInt)) {
      indexOfRowNumber = k;
      break;
    }
  }

  const result = [
    key.slice (0, indexOfRowNumber),
    parseInt (key.slice (indexOfRowNumber), 10),
  ];

  return result;
}

const checkForOrphanedCells = (workbook) => {
  const sheets = ['data', 'vars_meta_data', 'dataset_meta_data'];

  // fns
  const isCellKey = (key) => key.charCodeAt(0) !== 33; // props that are not cells begin with '!'
  const groupRowsByCol = (acc, curr) => { // reduce: group by col
    const [col, row] = curr;
    if (acc[col]) {
      acc[col] = acc[col].concat(row);
    } else {
      acc[col] = [row];
    }
    return acc;
  }
  const colHasNoHeadRow = ([, rowsArr]) => {
    if (rowsArr.every ((row) => row !== 1)) {
      return true;
    } else {
      return false;
    }
  }

  // calculate results
  const getOrphanedCells = (sheet) => {
    const cols = Object.keys (sheet)
                       .filter (isCellKey)
                       .map (splitKey)
                       .reduce (groupRowsByCol, {});


    const colEntriesWithoutHeadRow = Object.entries(cols).filter (colHasNoHeadRow);
    const result = Object.fromEntries (colEntriesWithoutHeadRow);
    return result;
  }

  return sheets.reduce ((acc, sheetName) => {
    return Object.assign (acc, {
      [sheetName]: getOrphanedCells (workbook.Sheets[sheetName]),
    });
  }, {});
}

const orphanedCellsCheck = (args) => {
  const { workbook } = args;

  const results = [];

  const orphanedCells = checkForOrphanedCells (workbook);

  Object.keys (orphanedCells).forEach ((sheetName) => {
    const colKeys = Object.keys (orphanedCells[sheetName]);
    if (colKeys && colKeys.length) {
      results.push ({
        severity: severity.error,
        title: `Cells Outside of Defined Columns in the *\`${sheetName}\`* Sheet`,
        Component: IssueWithList,
        args: {
          text: `There are non-empty cells outside of the defined columns. Data in these cells will be lost. Please preserve your data, if needed, and remove the values from these cells:`,
          list: colKeys.map ((key) => {
            const rows = orphanedCells[sheetName][key];
            return `Column: ${key}, Row: ${rows.join (',')}`;
          }),
        }
      });
    }
  });

  return results;
}

const auditFn = requireWorkbookArg (AUDIT_NAME, orphanedCellsCheck);

const orphanedCellsAudit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  auditFn
);

export default orphanedCellsAudit;
