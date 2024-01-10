import auditFactory, { requireWorkbookArg } from './auditFactory';
import IssueWithList from '../IssueWithList';
import severity from './severity';

const AUDIT_NAME = 'Orphaned Cells';
const DESCRIPTION = 'Check for orphaned cells';

// helpers

const isCellKey = (key) => key.charCodeAt(0) !== 33; // props that are not cells begin with '!'

const isNum = (char) => !isNaN(parseInt(char, 10));

const getLeadingLettersInKey = (str) => {
  let k = 0;
  while (!isNum (str.charAt(k))) {
    k++;
  }
  return str.slice(0, k);
}

const getNumberOfRows = (worksheet) => {
  const ref = worksheet['!ref'];
  if (!ref) {
    return -1;
  }
  const [, endCell] = ref.split(':');
  let k = 0;
  while (!isNum (endCell.charAt(k))) {
    k++;
  }

  const endRow = parseInt(endCell.slice(k), 10);
  return endRow;
}

const findCellsWithDataInCol = (worksheet, col) => {
  const numRows = getNumberOfRows (worksheet);
  let cellsWithData = [];
  for (let k = 1; k <= numRows; k++) {
    if (worksheet[`${col}${k}`]) {
      cellsWithData.push ([col, k]);
    }
  }
  return cellsWithData;
};


const checkForOrphanedCells2 = (workbook) => {
  const sheets = ['data', 'vars_meta_data', 'dataset_meta_data'];

  const getOrphanedCells = (sheet) => {
    // iterate and extract column names, e.g. 'A' .. 'J'
    // NOTE: do this so as not to assume character set or order or naming pattern
    const cols = new Set();
    Object.keys (sheet).forEach ((k) => {
      if (isCellKey (k)) {
        const colDesignation = getLeadingLettersInKey(k);
        cols.add (colDesignation);
      }
    });

    const hasHeaderCell = (col) => sheet[`${col}1`];
    const colsWithNoHeader = []; // cols with no header cell
    for (const k of cols) {
      if (!hasHeaderCell(k)) {
        colsWithNoHeader.push (k);
      }
    }

    // for cols with no header cell, get cells in that col with data
    const orphanedCells = colsWithNoHeader.reduce ((acc, colKey) => {
      const cellsWithData = findCellsWithDataInCol (sheet, colKey);
      return acc.concat(cellsWithData);
    }, []);

    return orphanedCells;
  }

  // run for each worksheet

  return sheets.reduce ((acc, sheetName) => {
    return Object.assign (acc, {
      [sheetName]: getOrphanedCells (workbook.Sheets[sheetName]),
    });
  }, {});

};

const orphanedCellsCheck = (args) => {
  const { workbook } = args;
  const results = [];

  const orphanedCellsBySheet = checkForOrphanedCells2 (workbook);

  Object.keys (orphanedCellsBySheet).forEach ((sheetName) => {
    const colKeys = orphanedCellsBySheet[sheetName];
    if (colKeys && colKeys.length) {
      results.push ({
        severity: severity.error,
        title: `Cells Outside of Defined Columns in the *\`${sheetName}\`* Sheet`,
        Component: IssueWithList,
        args: {
          text: `There are non-empty cells outside of the defined columns. Data in these cells will be lost. Please preserve your data, if needed, and remove the values from these cells:`,
          list: colKeys.map ((key) => {
            return `Cell ${key}`;
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
