import auditFactory, {
  requireWorkbookAndDataSheet,
  makeIssueWithCustomComponent,
} from './auditFactory';
import IssueWithList from '../IssueWithList';
import severity from './severity';
import { safePath } from '../../../../Utility/objectUtils';

const AUDIT_NAME = 'Duplicate Datasheet Columns';
const DESCRIPTION = 'Check data for duplicate columns';

const findDuplicateValuesInArray = (arr) => {
  const sorted = arr.slice().sort(); // now identical values will be adjacent
  let results = {};
  for (let k = 0; k < sorted.length - 1; k++) {
    if (sorted[k + 1] == sorted[k]) {
      if (!results[sorted[k]]) {
        results[sorted[k]] = true;
      }
    }
  }
  return Object.keys(results);
};

const checkDuplicateColumnHeaders = (workbook) => {
  // "h" is the key for "header"
  const dataCols = Object.keys(workbook.Sheets.data)
                         .filter ((k) => safePath ([k, 'h']) (workbook.Sheets.data))
                         .map ((k) => safePath ([k, 'h']) (workbook.Sheets.data));

  const duplicates = findDuplicateValuesInArray (dataCols);

  return duplicates;
};

export const reportDuplicateDataColumnHeaders = (workbook, dataSheet) => {
  // 1. get actual duplicate headers in data sheet from workbook data
  const duplicateHeadersFromWorkbook = checkDuplicateColumnHeaders (workbook);

  // sheetjs renames duplicate headers as <name>_1, <name>_2, and so on
  const parseColumnHeader = (header) => {
    const parsedValues = {
      original: header,
    };
    const indexOfUnderscore = header.lastIndexOf ('_');
    if (indexOfUnderscore < header.length - 1) {
      const suffix = header.slice (indexOfUnderscore + 1);
      const isInteger = !isNaN(parseInt (suffix, 10));
      if (isInteger) {
        parsedValues.maybeRenamed = true;
        parsedValues.maybeDuplicateName = header.slice (0, indexOfUnderscore);
      }
    }
    return parsedValues;
  };

  const findOriginalColumnLetter = (header) => {
    const result = Object.keys(workbook.Sheets.data)
                         .filter ((k) => header === safePath ([k, 'h']) (workbook.Sheets.data));
    return result;
  }

  // 2. get headers from json representation of data sheet
  const dataSheetHeaders = Object.keys(dataSheet[0]);

  // 3. parse headers and identify possible renamed values
  const parsedHeaders = dataSheetHeaders.map (parseColumnHeader);

  // 4. create list of matches
  const matchedHeaders = parsedHeaders.reduce ((acc, parsedValue) => {
    const maybeDuplicate = parsedValue.maybeDuplicateName;
    if (maybeDuplicate && duplicateHeadersFromWorkbook.includes (maybeDuplicate)) {
      const maybeOriginalColumns = findOriginalColumnLetter (maybeDuplicate);
      const newMatchedEntry = [
        parsedValue.maybeDuplicateName,
        Object.assign({}, parsedValue, { maybeOriginalColumns })
      ];
      if (acc.length) {
        return [...acc, newMatchedEntry];
      } else {
        return [newMatchedEntry];
      }
    }
    return acc;
  }, []);


  return {
    duplicatesExist: Boolean(matchedHeaders.length),
    duplicates: Object.fromEntries (matchedHeaders)
  }
}

// :: args -> [result]
const auditFn = (standardArgs) => {
  const { workbook, data } = standardArgs;
  const results = []

  const { duplicatesExist, duplicates: duplicateHeaders } =
    reportDuplicateDataColumnHeaders (workbook, data);

  if (duplicatesExist) {
    results.push (makeIssueWithCustomComponent (
      severity.error,
      'Duplicate Columns in the Data Sheet',
      IssueWithList,
      {
        text: `The following columns in the *\`data\`* sheet occur more than once. Please remove extra or redundant columns.`,
        list: Object.entries(duplicateHeaders).map (([header, headerData]) => {
          const originalCols = headerData.maybeOriginalColumns.length
                             ? headerData.maybeOriginalColumns.map ((v) => `*\`${v}\`*`).join (', ')
                             : '';
          const str = originalCols.length ? ` (originally in columns ${originalCols})` : '';
          return `The header *\`${header}\`*${str} has a duplicate which has been renamed *\`${headerData.original}\`*`
        }),
      }
    ));
  }

  return results;
}

const audit = auditFactory (
  AUDIT_NAME,
  DESCRIPTION,
  requireWorkbookAndDataSheet (AUDIT_NAME, auditFn),
);

export default audit;
