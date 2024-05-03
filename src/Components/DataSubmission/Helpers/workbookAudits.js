import { mean, deviation } from 'd3-array';
import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import IssueWithList from './IssueWithList';
import messages from '../Messages';
import { orderedColumns } from '../ValidationToolConstants';
import mainAuditExecution from './WorkbookAudits/index';

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
  if (data.length < 2) {
    return false; // if data is only 1 row, we don't need a uniqueness check
  }
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
  // console.log (`${sheet.length} rows compared in ${(end - start)/100}s`);

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

// execution

export default (args) => {
  const {
    workbook, // workboork is the file prior to conversion by sheetjs to json
    data, // the data sheet
    dataset_meta_data,  // the metadata sheet
    vars_meta_data, // the vars metadata sheet

    // time formatting flags
    is1904,
    numericDateFormatConverted,

    // check name
    checkNameResult,
    submissionType,
  } = args;


  if (!checkNameResult) {
    return { errors: [], warnings: [] };
  }

  console.log ('workbook audit called', submissionType, checkNameResult);

  const results = mainAuditExecution (args);
  return results;

  // removed orphaned cells check

  // removed name check

  // removed checkSheets

  // removed duplicates check

  // removed dateCheck

  // data sheet checks

};

/*


     if (data && Array.isArray(data)) {


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



  console.log ('WORKBOOK AUDIT', { errors, warnings, confirmations })
  return { errors, warnings, confirmations, first };

*/
