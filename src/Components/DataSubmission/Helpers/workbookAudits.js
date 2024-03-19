import { mean, deviation } from 'd3-array';
import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import IssueWithList from './IssueWithList';
import { safePath } from '../../../Utility/objectUtils';
import messages from '../Messages';
import { orderedColumns } from '../ValidationToolConstants';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(LocalizedFormat);

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

const datasetMetadataSampleRowValue =
  '< short name of your dataset (<50 chars) >';
const variableMetadataSampleRowValue = '< variable short name (<50 chars) >';

let checkSheets = (workbook) => {
  let expected = ['data', 'vars_meta_data', 'dataset_meta_data'];
  let missingSheets = [];

  expected.forEach((e) => {
    if (!workbook.Sheets[e]) {
      missingSheets.push(e);
    }
  });

  return missingSheets;
};

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
  // console.log (`split ${key} => [${result[0]}, ${result[1]}]`)
  return result;
}

const checkForOrphanedCells_ = (workbook) => {
  const sheets = ['data', 'vars_meta_data', 'dataset_meta_data'];

  const getOrphanedCells = (sheet) => {
    // fn
    const isHeaderCell = (key) => {
      const cell = sheet[key];
      return cell.v === cell.w && cell.w === cell.h; // h, v, w are the same
    };
    // fn
    const isNotFirstRow = (key) => {
      const [, row] = splitKey (key);
      if (row !== 1) {
        return true;
      } else {
        return false;
      }
    }

    const orphanedCellKeys = Object.keys (sheet)
                                   .filter (isHeaderCell)
                                   .filter (isNotFirstRow);

    return orphanedCellKeys;
  }

  const result = sheets.reduce ((acc, sheetName) => {
    return Object.assign (acc, {
      [sheetName]: getOrphanedCells (workbook.Sheets[sheetName]),
    });
  }, {});

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

    // console.log (`grouped entries`, cols)

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

let checkEveryVarsShortNameHasDataCol = (data, vars_meta_data, userVariables) => {
  if (!vars_meta_data || !userVariables) {
    return [];
  }
  const varsShortNames = vars_meta_data.map((e) => e.var_short_name);
  return varsShortNames.filter((e) => !userVariables.has(e));
};

let checkEveryDataColHasVarsMetaDefinition = (data, vars_meta_data) => {
  if (!vars_meta_data || !data) {
    return [];
  }
  let fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  let userDefinedDataCols = Object.keys(data[0]).filter((key) => !fixedVariables.has(key));
  const varsShortNames = vars_meta_data.map((e) => e.var_short_name);
  return userDefinedDataCols.filter ((c) => !varsShortNames.includes(c));
};

const checkValuesAreUnique = (sheet, header) => {
  if (!sheet || !Array.isArray(sheet)) {
    return;
  }
  if (!header) {
    return;
  }

  const columnValues = sheet.map ((row) => row[header]);
  const duplicateValues = findDuplicateValuesInArray (columnValues);

  return duplicateValues;
}

let checkEmptyColumns = (data, userVariables) => {
  let emptyColumns = [];

  if (userVariables) {
    userVariables.forEach((header) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i][header] || data[i][header] === 0) {
          return;
        }
      }
      emptyColumns.push(header);
    });
  }

  return emptyColumns;
};

let checkMissingCruiseNames = (dataset_meta_data, vars_meta_data) => {
  if (!vars_meta_data || !dataset_meta_data) {
    return false;
  }
  let hasInSitu = vars_meta_data.some(
    (e) => e.var_sensor && e.var_sensor.toLowerCase() == 'in-situ',
  );
  let isObservation =
    dataset_meta_data[0].dataset_make &&
    dataset_meta_data[0].dataset_make.toLowerCase() == 'observation';
  let shouldHaveCruise = Boolean(hasInSitu && isObservation);
  let hasCruise = dataset_meta_data[0]['cruise_names'];
  return Boolean(shouldHaveCruise && !hasCruise);
};

let checkMultipleCruisesOneCell = (dataset_meta_data) =>
  Boolean(
    typeof dataset_meta_data[0].cruise_names === 'string' &&
    dataset_meta_data[0].cruise_names.includes(','),
  );

let checkRadians = (data) => {
  let lonMin = data[0].lon;
  let lonMax = data[0].lon;
  let latMin = data[0].lat;
  let latMax = data[0].lat;
  let pi = Math.PI;

  data.forEach((e) => {
    if (e.lon < lonMin) {
      lonMin = e.lon;
    }
    if (e.lon > lonMax) {
      lonMax = e.lon;
    }
    if (e.lat < latMin) {
      latMin = e.lat;
    }
    if (e.lat > latMax) {
      latMax = e.lat;
    }
  });

  return Boolean(
    lonMin >= -pi && lonMax <= pi && latMin >= -pi / 2 && latMax <= pi / 2,
  );
};

let checkUniqueSpaceTime = (data) => {
  let includeDepth = Boolean(data[0].depth || data[0].depth == 0);
  let obj = {};
  let result = []; //{row: Number, matched: Number}

  try {
    for (let i = 0; i < data.length; i++) {
      if (obj[data[i].time] === undefined) {
        obj[data[i].time] = {};
      }

      if (obj[data[i].time][data[i].lat] === undefined) {
        obj[data[i].time][data[i].lat] = {};
      }

      if (!includeDepth) {
        if (obj[data[i].time][data[i].lat][data[i].lon] === undefined) {
          obj[data[i].time][data[i].lat][data[i].lon] = i + 2;
        } else {
          result.push({
            row: i + 2,
            matched: obj[data[i].time][data[i].lat][data[i].lon],
          });
          if (result.length > 5) {
            return result;
          }
        }
      } else {
        if (obj[data[i].time][data[i].lat][data[i].lon] === undefined) {
          obj[data[i].time][data[i].lat][data[i].lon] = {};
        }

        if (
          obj[data[i].time][data[i].lat][data[i].lon][data[i].depth] ===
            undefined
        ) {
          obj[data[i].time][data[i].lat][data[i].lon][data[i].depth] = i + 2;
        } else {
          result.push({
            row: i + 2,
            matched: obj[data[i].time][data[i].lat][data[i].lon][data[i].depth],
          });
          if (result.length > 5) {
            return result;
          }
        }
      }
    }
  } catch (e) {
    result = [];
  }

  return result;
};

let checkTypeConsistency = (data, userVariables) => {
  // Look for mixture of strings and numbers
  let result = [];

  userVariables.forEach((e) => {
    let columnIsNumerical;
    for (let i = 0; i < data.length; i++) {
      if (columnIsNumerical === undefined) {
        if (data[i][e] || data[i][e] == 0) {
          columnIsNumerical = !isNaN(parseFloat(data[i][e]));
        }
      } else if (columnIsNumerical && (data[i][e] || data[i][e] == 0)) {
        if (isNaN(parseFloat(data[i][e]))) {
          result.push({ column: e, row: i + 2 });
          break;
        }
      } else if (data[i][e] || data[i][e] == 0) {
        if (!isNaN(parseFloat(data[i][e]))) {
          result.push({ column: e, row: i + 2 });
          break;
        }
      }
    }
  });

  return result;
};

let allSameValueHelper = (data, col) => {
  let sampleValue;
  let i = 0;

  while (sampleValue === undefined && i < data.length) {
    if (data[i][col] || data[i][col] == 0) {
      sampleValue = data[i][col];
    }
    i++;
  }

  for (let j = i; j < data.length; j++) {
    if (data[j][col] != sampleValue) {
      return false;
    }
  }

  return true;
};

let checkAllSameValue = (data, userVariables) => {
  let result = [];

  userVariables.forEach((e) => {
    let allSame = allSameValueHelper(data, e);
    if (allSame) {
      result.push(e);
    }
  });

  return result;
};

const checkDepthAllOrNone = (data) => {
  if (!data || !data[0]) {
    return true;
  }
  let includeDepth = Boolean(data[0].depth || data[0].depth == 0);

  for (let i = 0; i < data.length; i++) {
    if (includeDepth != Boolean(data[i].depth || data[i].depth == 0)) {
      return false;
    }
  }

  return true;
};

const datasetMetadataIncludesSampleRow = (datasetMetadata) => {
  if (!datasetMetadata || !datasetMetadata[0]) {
    return false;
  }
  for (let i = 0; i < datasetMetadata.length; i++) {
    if (
      typeof datasetMetadata[i]['dataset_short_name'] === 'string' &&
      datasetMetadata[i]['dataset_short_name'].includes(
        datasetMetadataSampleRowValue,
      )
    ) {
      return true;
    }
  }
  return false;
};

let variableMetadataIncludesSampleRow = (variableMetadata) => {
  for (let i = 0; i < variableMetadata.length; i++) {
    if (
      typeof variableMetadata[i]['var_short_name'] === 'string' &&
      variableMetadata[i]['var_short_name'].includes(
        variableMetadataSampleRowValue,
      )
    ) {
      return true;
    }
  }
  return false;
};

let nanVariants = new Set(['nan', 'NaN', 'NAN', 'Nan', 'null', 'Null', 'NULL']);
let checkNans = (data, userVariables) => {
  let result = []; // {row, column}

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < userVariables.length; j++) {
      if (nanVariants.has(data[i][userVariables[j]])) {
        result.push({ row: i + 2, column: userVariables[j] });
        if (result.length > 4) {
          return result;
        }
      }
    }
  }

  return result;
};

let outlierN = 5;
let checkOutliers = (data, userVariables) => {
  let outliers = []; //{row, column}
  let vectors = {};
  userVariables.forEach((e) => (vectors[e] = []));

  let stats = {};
  userVariables.forEach((e) => (stats[e] = {}));

  data.forEach((row) => {
    userVariables.forEach((e) => {
      vectors[e].push(row[e]);
    });
  });

  userVariables.forEach((e) => {
    stats[e].mean = mean(vectors[e]);
    stats[e].deviation = deviation(vectors[e]);
  });

  let keys = Object.keys(stats);

  for (let i = 0; i < keys.length; i++) {
    if (
      (stats[keys[i]].mean || stats[keys[i]].mean === 0) &&
      (stats[keys[i]].deviation || stats[keys[i]].deviation === 0)
    ) {
      for (let j = 0; j < data.length; j++) {
        if (
          (data[j][keys[i]] || data[j][keys[i]] == 0) &&
          Math.abs(data[j][keys[i]] - stats[keys[i]].mean) >
          outlierN * stats[keys[i]].deviation
        ) {
          outliers.push({
            row: j + 2,
            column: keys[i],
            value: data[j][keys[i]],
          });
          if (outliers.length > 9) {
            return outliers;
          }
        }
      }
    }
  }

  return outliers;
};

const checkRequiredCols = (data) => {
  if (!data || !data[0]) {
    return [];
  }
  let missingCols = [];
  let sample = data[0];

  ['time', 'lat', 'lon'].forEach((e) => {
    if (!sample[e] && sample[e] !== 0) {
      missingCols.push(e);
    }
  });

  return missingCols;
};

let is1904Format = (workbook) => {
  return Boolean(((workbook.Workbook || {}).WBProps || {}).date1904);
}

const checkDateFormat = (data, workbook, numericDateFormatConverted) => {
  if (!data || !Array.isArray(data) || data[0].time === undefined) {
    return {
      error: 'Missing value(s) in time column.'
    };
  }
  const sample = data[0].time;
  const dataType = typeof sample;

  const readableString = dayjs.utc(sample).format('LLLL');
  const example = `For reference, the time value in the first row of data is ${sample} and will be interpreted as ${readableString}`;

  if (dataType === 'number') {
    if (is1904Format (workbook)) {
      return {
        error: `The submitted file uses Date1904 formatting for time values. Please convert to normal excel format, and verify values are accurate. ${example}`,
      }
    }
  }

  if (numericDateFormatConverted) {
    return {
      warning: `The submitted file uses numeric values for date-times. These have been converted to string values. Please examine them for accuracy in the next validation step.`,
    }
  }

  return;
};

const checkEqualLengthColsAndVarMetaData = (userVariables, vars_meta_data) => {
  const dataCols = userVariables.size;
  const definedVars = vars_meta_data.length;
  if (dataCols !== definedVars) {
    return {
      dataCols,
      definedVars,
    }
  }
}

const checkExtraColumns = (sheet, sheetName) => {
  if (!sheet || sheet.length < 1) {
    console.log ('no data to check in checkExtraColumns', sheetName);
    return;
  }
  const columnHeaders = Object.keys(sheet[0]);
  const approvedHeaders = orderedColumns[sheetName];

  console.log (`checking ${sheetName} for extra colmns`, { columnHeaders, approvedHeaders });

  if (!columnHeaders || !approvedHeaders) {
    return;
  }

  const nonMatchedHeaders = columnHeaders.filter ((header) => !approvedHeaders.includes(header));
  if (nonMatchedHeaders.length) {
    return nonMatchedHeaders;
  }
}


const checkDuplicateColumnHeaders = (workbook) => {
  // "h" is the key for "header"
  const dataCols = Object.keys(workbook.Sheets.data)
                         .filter ((k) => safePath ([k, 'h']) (workbook.Sheets.data))
                         .map ((k) => safePath ([k, 'h']) (workbook.Sheets.data));

  const duplicates = findDuplicateValuesInArray (dataCols);

  return duplicates;
};

// sheet agnostic version of checkDuplicateColumnHeaders
const checkDuplicateColumnHeadersForSheet = (workbook, sheet, sheetName) => {
  const getHeader = (key) => safePath ([sheetName, key, 'h']) (workbook.Sheets);
  const exists = (val) => Boolean(val);

  const dataCols = Object.keys(workbook.Sheets[sheetName])
                         .map (getHeader)
                         .filter (exists)

  return findDuplicateValuesInArray (dataCols);
}

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

// NOTE this should not be used for data sheet if it has too many rows
export const checkNoDuplicateRows = (sheet) => {
  if (!sheet || !Array.isArray(sheet) || !sheet[0]) {
    console.log ('expected data sheet in checkNoDuplicateRows audit but received:', sheet);
    return;
  }
  const columnHeaders = Object.keys(sheet[0]);

  const rowsAreSame = (a, b) => {
    return columnHeaders.every ((headerKey) => a[headerKey] === b[headerKey]);
  }

  const start = Date.now();
  const result = sheet.reduce ((results, currentRow, index, arr) => {
    // as reduce advances down the rows, we don't need to compare to rows we've already checked
    // get a slice of the array from the current index,
    // compare current row with all rows in that slice
    if (index === arr.length - 1) {
      return results; // end
    }
    const rowsToCompare = arr.slice (index + 1);

    const identicalRows = rowsToCompare.reduce ((identicalIndexes, currentComparison, sliceIndex) => {
      if (rowsAreSame (currentRow, currentComparison)) {
        return identicalIndexes.concat (1 + index + sliceIndex);
      } else {
        return identicalIndexes;
      }
    }, []);

    if (identicalRows.length) {
      results.push ([index, identicalRows]); // keep result in the form of an entry
    }

    return results;
  }, []);


  const end = Date.now();
  console.log (`${sheet.length} rows compared in ${(end - start)/100}s`);

  // emend results

  const rowIndexesWithDuplitates = result.map ((entry) => entry[0]);
  const finalResult = result.map ((entry, index, arr) => {
    const targetRowIndex = entry[0]; // :: Integer // this is the index we are testing
    // do prior entries contain this one as a duplicate?
    const priorSlice = result.slice (0, targetRowIndex);
    const priorMatches = priorSlice
      .filter ((priorEntry) => priorEntry[1].includes(targetRowIndex)) // narrow to entries that mark currnt as a duplicate
      .map ((matchingEntry) => matchingEntry[0]); // get matching index

    return [targetRowIndex, entry[1].concat(priorMatches).sort()]; // return emended entry
  });


  return {
    rowIndexesWithDuplitates,
    result: finalResult,
  };
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export default (args) => {
  const {
    workbook, // file prior to conversion by sheetjs to json
    data,
    dataset_meta_data,
    vars_meta_data,
    userDataSubmissions,
    numericDateFormatConverted,
    invalidDates,
    checkNameResult,
    submissionType,
    submissionToUpdate,
  } = args;

  console.log ('workbook audit called', submissionType, checkNameResult);

  let errors = [];
  let warnings = [];
  let confirmations = [];
  let first = [];

  // no file to work with yet
  if (!workbook) {
    return { errors, warnings };
  }


  if (workbook) {
    // check for orphaned cells
    const orphanedCells = checkForOrphanedCells (workbook);
    console.log ('orphaned cells', orphanedCells);
    Object.keys (orphanedCells).forEach ((sheetName) => {
      const colKeys = Object.keys (orphanedCells[sheetName]);
      if (colKeys && colKeys.length) {
        errors.push ({
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

  }

  // check name
  if (checkNameResult) {
    // 3 scenarios: (1) this is a new submission and one of the 2 names is taken
    // (2) this is an update and the names are the same (3) this is an update and the names are different

    const {
      shortNameIsAlreadyInUse,
      shortNameUpdateConflict,
      folderExists,
      longNameIsAlreadyInUse,
      longNameUpdateConflict,
      errors: nameCheckErrors,
    } = checkNameResult;

    const shortName = safePath(['0', 'dataset_short_name'])(dataset_meta_data);
    const longName = safePath(['0', 'dataset_long_name'])(dataset_meta_data);

    const newShortNameConflict = (shortNameIsAlreadyInUse || folderExists) && submissionType === 'new';
    const newLongNameConflict =  longNameIsAlreadyInUse && submissionType === 'new';

    if (nameCheckErrors.includes('No short name provided')) {
      errors.push({
        title: 'Dataset Short Name is Missing',
        detail: 'No short name was provided. Please add a name in the *`dataset_short_name`* field in the *`dataset_meta_data`* worksheet.',
      });
    } else if (newShortNameConflict) {
      errors.push({
        title: 'Dataset Short Name is Unavailable',
        detail: messages.shortNameIsTaken(shortName),
      });
    } else if (shortNameUpdateConflict) {
      console.log ('short name update conflict');
      if (userDataSubmissions && userDataSubmissions.length) {
        const shortNameBelongsToOtherSubmission = userDataSubmissions.find ((sub) => {
          return sub.Dataset === shortName && sub.Submission_ID !== submissionToUpdate;
        });
        const targetDataset = userDataSubmissions.find ((sub) => sub.Submission_ID === submissionToUpdate);
        if (shortNameBelongsToOtherSubmission && targetDataset) {
          first.push ({
            title: 'Did you pick the right file?',
            detail: `In the last step you selected the *\`${targetDataset.Dataset}\`* submission to update, but the file you uploaded has a short name of *\`${shortName}\`*, which already belongs to one of your other data submissions. Please check that you are updating the intended dataset submission with the correct data file.`,
          });
        }
      }
      errors.push({
        title: 'Unable to Update Short Name',
        detail: `The short name provided, *\`${shortName}\`*, is already in use by another dataset submission`,
      })
    }

    if (nameCheckErrors.includes('No long name provided')) {
      errors.push({
        title: 'Dataset Long Name is Missing',
        detail: 'No long name was provided. Please add a name in the *`dataset_long_name`* field in the *`dataset_meta_data`* worksheet.',
      });
    } else if (newLongNameConflict) {
      errors.push({
        title: 'Dataset Long Name is Unavailable',
        detail: messages.longNameIsTaken(longName),
      })
    } else if (longNameUpdateConflict) {
      errors.push({
        title: 'Unable to Update Long Name',
        detail: `The long name provided, *\`${longName}\`*, is already in use by another dataset submission`,
      })
    }
  }

  if (invalidDates) {
    errors.push ({
      title: 'Invalid Time Values',
      detail: `There are invalid time values in the data sheet.  You can proceed to the next step to view which rows have invalid time values. However, editing time values in this application is not enabled. To continue, please revise your submission file and re-upload it. Ensure that every row in the data sheet has a time value.`
    });
  }

  // checks for missing sheets or lacking rows are early-return cases
  let sheetCheck = checkSheets(workbook);

  if (sheetCheck.length) {
    const inflect = (sheetCheck.length > 1 ? 's' : '');
    const wrapInPreQuotes = (s) => `*\`${s}\`*`;
    const stringOfSheetNames = sheetCheck.map(wrapInPreQuotes).join (', ');
    errors.push({
      title: 'Workbook is missing worksheet' + inflect,
      body: {
        content: `Workbook is missing required sheet ${inflect}: ${stringOfSheetNames}. Please add worksheet${inflect} and {0}.`,
        links: [{
          text: 'resubmit',
          url: '/datasubmission/validationtool#step0'
        }]
      }
    });
  }

  if (!data || data.length === 0) {
    errors.push(`Found no rows on the data sheet`);
  }

  // data sheet checks
  if (data && Array.isArray(data)) {
    // check duplicate cols

    const { duplicatesExist, duplicates: duplicateHeaders } = reportDuplicateDataColumnHeaders (workbook, data);
    if (duplicatesExist) {
      errors.push ({
        title: 'Duplicate Columns in the Data Sheet',
        Component: IssueWithList,
        args: {
          text: `The following columns in the *\`data\`* sheet occur more than once. Please remove extra or redundant columns.`,
          list: Object.entries(duplicateHeaders).map (([header, headerData]) => {
            const originalCols = headerData.maybeOriginalColumns.length
                               ? headerData.maybeOriginalColumns.map ((v) => `*\`${v}\`*`).join (', ')
                               : '';
            const str = originalCols.length ? ` (originally in columns ${originalCols})` : '';
            return `The header *\`${header}\`*${str} has a duplicate which has been renamed *\`${headerData.original}\`*`
          }),
        }
      });
    }


    const dateCheckResult = checkDateFormat (data, workbook, numericDateFormatConverted);

    if (dateCheckResult) {
      if (dateCheckResult.error) {
        errors.push(dateCheckResult.error);
      }
      if (dateCheckResult.warning) {
        warnings.push(dateCheckResult.warning);
      }
      if (dateCheckResult.confirm) {
        confirmations.push (dateCheckResult.confirm);
      }
    }

    const check1904DateFormat = is1904Format (workbook);
    if (check1904DateFormat) {
      warnings.push (messages.is1904Error)
    }

    let missingCols = checkRequiredCols(data);
    if (missingCols.length) {
      errors.push(
        `Data sheet is missing required column${missingCols.length > 1 ? 's' : ''}: ${missingCols.join(', ')}`,
      );
    }

    if (vars_meta_data) {
      const unmatchedShortNames = checkEveryVarsShortNameHasDataCol (data, vars_meta_data);
      if (unmatchedShortNames && unmatchedShortNames.length) {
        errors.push ({
          title: 'Variable Short Name Has to Matching Data Column',
          Component: IssueWithList,
          args: {
            text: `The following values for *\`var_short_name\`* in the *\`vars_meta_data\`* sheet did not match any column header on the data sheet:`,
            list: unmatchedShortNames,
          }
        });
      }
    }


    let fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
    let userVariables = new Set(
      Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
    );

    if (vars_meta_data) {
      let unidentifiedDataCols = checkEveryDataColHasVarsMetaDefinition(
        data,
        vars_meta_data,
        userVariables,
      );
      if (unidentifiedDataCols && unidentifiedDataCols.length) {
        errors.push({
          title: 'Unidentified Columns in the Data Sheet',
          Component: IssueWithList,
          args: {
            text: `The following columns in the *\`data\`* sheet are not defined in the *\`vars_meta_data\`* sheet:`,
            list: unidentifiedDataCols,
          }
        });
      }

      let inequalLengthColsAndVarMetaData = checkEqualLengthColsAndVarMetaData (userVariables, vars_meta_data);
      if (inequalLengthColsAndVarMetaData) {
        const { dataCols, definedVars } = inequalLengthColsAndVarMetaData;
        errors.push ({
          title: 'Inequal Number of Data Columns and Variable Definitions',
          detail: `There are ${dataCols} custom data columns in the *\`data sheet\`*, but ${definedVars} variables defined in the *\`vars_meta_data\`* sheet.`
        })
      }
    }


    let emptyColumns = checkEmptyColumns(data, userVariables);
    if (emptyColumns.length) {
      errors.push({
        title: `Data Columns Without Any Values`,
        detail: `The column${emptyColumns.length > 1 ? 's' : ''} \`${emptyColumns.join(
        ', ')}\` contain${emptyColumns > 1 ? '' : 's'} no values.`,
      });
    }


    if (!checkDepthAllOrNone(data)) {
      errors.push(
        'The depth column on the data sheet must contain a value for every row, or be empty.',
      );
    }

    if (checkRadians(data)) {
      warnings.push(
        `Values supplied for lat and lon indicate the possible use of radian as unit of measurement.` +
        `Lat and lon must be in degrees north and degrees east, respectively.`,
      );
    }

    const duplicates = checkUniqueSpaceTime(data);
    if (duplicates.length) {
      warnings.push(
        `Found non-unique space and time value combinations` +
        `${
          duplicates.length >= 5 ? '(Showing a maximum of 5 matches)' : ''
        }:\n` +
        `${duplicates
          .map((e) => `Row ${e.row} matched ${e.matched}`)
          .join('\n')}`,
      );
    }

    let typeConsistency = checkTypeConsistency(data, userVariables);
    if (typeConsistency.length) {
      warnings.push(
        `Found column${
        typeConsistency.length > 1 ? 's' : ''
      } with a mixture of string and numerical data types.` +
        `\n${typeConsistency
          .map(
            (e) =>
        `Column ${e.column} contained a value of unexpected type in row ${e.row}`,
          )
          .join('\n')}`,
      );
    }

    let allSameValue = checkAllSameValue(data, userVariables);
    if (allSameValue.length) {
      warnings.push(
        `Found column${
        allSameValue.length > 1 ? 's' : ''
      } on data sheet with all identical values: ${allSameValue.join(', ')}.`,
      );
    }

    let containsNans = checkNans(data, userVariables);
    if (containsNans.length) {
      errors.push(
        `NaN and null strings are not allowed. Cells should contain a value or be blank.` +
        `${containsNans.length > 4 ? 'Showing a maximum of 5 matches.' : ''}` +
        `Found illegal value${containsNans.length > 1 ? 's' : ''}` +
        `at ${containsNans
          .map((e) => `row ${e.row} column ${e.column}`)
          .join('\n')}.`,
      );
    }

    let outliers = checkOutliers(data, userVariables);
    if (outliers.length) {
      warnings.push(
        `Found possible data outlier${outliers.length > 1 ? 's' : ''} ` +
        `${outliers.length > 9 ? '(Showing a maximum of 10 values)' : ''}:\n` +
        `${outliers
          .map((e) => `Value ${e.value} in column ${e.column} row ${e.row}`)
          .join('\n')}`,
      );
    }

    if (data.length < 10000) {
      const { rowIndexesWithDuplitates, result } = checkNoDuplicateRows (data);
      if (rowIndexesWithDuplitates.length) {
        errors.push ({
          title: `Repeated Rows in Data Sheet`,
          Component: IssueWithList,
          args: {
            text: `The following ${result.length} row(s) of the data sheet are repeated (all values, for every column, are the same):`,
            list: result.map ((r) => `${r[0]} is repeated in rows ${r[1].join (', ')}`),
          }
        });
      }
    } else {
      confirmations.push ({
        title: 'Did Not Check For Duplicate Rows',
        detail: `Please note that because the dataset is large, the validator did not check for the existence of repeated rows.`
      });
    }

  }

  // dataset meta data checks
  if (dataset_meta_data) {
    if (datasetMetadataIncludesSampleRow(dataset_meta_data)) {
      errors.push(
        'The value "< short name of your dataset (<50 chars) >" was found in the dataset_short_name column ' +
        'of the dataset_meta_data sheet. Please delete the template sample row and re-select the workbook by clicking ' +
        '"select a different file" above.',
      );
    }
    if (checkMultipleCruisesOneCell(dataset_meta_data)) {
      warnings.push(
        `The cruise_names column of the dataset_meta_data sheet may contain multiple cruises in one cell. Please separate ` +
        `cruise names beyond the first into separate rows in this column.`,
      );
    }

    const extraColumns = checkExtraColumns (dataset_meta_data, 'dataset_meta_data');
    if (extraColumns) {
      errors.push ({
        title: 'Extra Columns in Dataset Metadata Sheet',
        Component: IssueWithList,
        args: {
          text: `The following columns in the *\`dataset_meta_data\`* sheet have been added. Please use only the columns provided in the Data Submission Template.`,
          list: extraColumns,
        }
      });
    }
  }


  // vars_metadata checks
  if (vars_meta_data) {
    if (variableMetadataIncludesSampleRow(vars_meta_data)) {
      errors.push(
        'The value "< variable short name (<50 chars) >" was found in the var_short_name column ' +
        'of the vars_meta_data sheet. Please delete the template sample row and re-select the workbook by clicking ' +
        '"select a different file" above.',
      );
    }

    const extraColumns = checkExtraColumns (vars_meta_data, 'vars_meta_data');
    if (extraColumns) {
      errors.push ({
        title: 'Extra Columns in Variable Metadata Sheet',
        Component: IssueWithList,
        args: {
          text: `The following columns in the *\`var_meta_data\`* sheet have been added. Please use only the columns provided in the Data Submission Template.`,
          list: extraColumns,
        }
      });
    }

    const duplicateShortNames = checkValuesAreUnique (vars_meta_data, 'var_short_name');
    if (duplicateShortNames && duplicateShortNames.length) {
      errors.push ({
        title: `Duplicate Variable Short Names`,
        Component: IssueWithList,
        args: {
          text: `*\`var_short_name\`*s must be unique. The following *\`var_short_name\`* values are repeated in the *\`vars_meta_data\`* sheet. :`,
          list: duplicateShortNames,
        }
      });
    }

    const duplicateLongNames = checkValuesAreUnique (vars_meta_data, 'var_long_name');
    if (duplicateLongNames && duplicateLongNames.length) {
      errors.push ({
        title: `Duplicate Variable Long Names`,
        Component: IssueWithList,
        args: {
          text: `*\`var_long_name\`*s must be unique. The following *\`var_long_name\`* values are repeated in the *\`vars_meta_data\`* sheet. :`,
          list: duplicateLongNames,
        }
      });
    }

    // TODO check duplicate cols

    const { rowIndexesWithDuplitates, result } = checkNoDuplicateRows (vars_meta_data);
    if (rowIndexesWithDuplitates.length) {
      errors.push ({
        title: `Repeated Rows in Variable Metadata Sheet`,
        Component: IssueWithList,
        args: {
          text: `The following ${result.length} row(s) of the *\`vars_meta_data\`* sheet are repeated (all values, for every column, are the same):`,
          list: result.map ((r) => `row ${r[0]} is repeated in row(s) ${r[1].join (', ')}`),
        }
      });
    }
  }


  if (checkMissingCruiseNames(dataset_meta_data, vars_meta_data)) {
    warnings.push(
      `The supplied values for make and sensor suggest that some or all of your data may ` +
      `have been gathered on a scientific cruise, but no values were included for cruise_names in the dataset_meta_data sheet. ` +
      `Including cruise names will improve the discoverability of your data.`,
    );
  }



  console.log ('returning workbook audit', { errors, warnings, confirmations })
  return { errors, warnings, confirmations, first };
};
