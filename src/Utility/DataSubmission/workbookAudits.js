import { mean, deviation } from 'd3-array';
import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import messages from '../../Components/DataSubmission/Messages';

dayjs.extend(utc);
dayjs.extend(tz);


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

let checkVariableNameMismatches = (data, vars_meta_data, userVariables) => {
  let shortNames = vars_meta_data.map((e) => e.var_short_name);
  return shortNames.filter((e) => !userVariables.has(e));
};

const checkMissingVarMetadataRows = (data, vars_meta_data, userVariables) => {
  let shortNames = new Set(vars_meta_data.map((e) => e.var_short_name));
  return Array.from(userVariables).filter((e) => !shortNames.has(e));
};

let checkEmptyColumns = (data, userVariables) => {
  let emptyColumns = [];

  userVariables.forEach((header) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][header] || data[i][header] === 0) {
        return;
      }
    }

    emptyColumns.push(header);
  });

  return emptyColumns;
};

let checkMissingCruiseNames = (dataset_meta_data, vars_meta_data) => {
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

let checkDepthAllOrNone = (data) => {
  let includeDepth = Boolean(data[0].depth || data[0].depth == 0);

  for (let i = 0; i < data.length; i++) {
    if (includeDepth != Boolean(data[i].depth || data[i].depth == 0)) {
      return false;
    }
  }

  return true;
};

let datasetMetadataIncludesSampleRow = (datasetMetadata) => {
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

let checkRequiredCols = (data) => {
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
  // const isValidDate = dayjs(sample).isValid();
  // const dateSample = dayjs(sample).tz();

  const utcString = dayjs.utc(sample).format();
  // const utcDateString = `${dayjs.utc(sample).format('YYYY-MM-DD')} (YYYY-MM-DD)`;

  const example = `For reference, the time value in the first row of data is ${sample} and will be interpreted as ${utcString}`;

  console.log ('type of time column sample: ' + dataType);

  if (dataType === 'number') {
    if (is1904Format (workbook)) {
      return {
        error: `The submitted file uses Date1904 formatting for time values. Please convert to normal excel format, and verify values are accurate. ${example}`,
      }
    }
    // else: should not be reachable
    // numerically formatted dates should already be converted IF they are not 1904 encoded
  }

  if (numericDateFormatConverted) {
    return; // if the format has been converted, do not display the default
    // warning to check time fields: there will be a conversion warning
  }
  return {
    warning: `Please double-check that the time field is entered correctly. ${example}`,
  };
};

export default (args) => {
  const {
    data,
    dataset_meta_data,
    vars_meta_data,
    workbook,
    numericDateFormatConverted,
  } = args;
  let errors = [];
  let warnings = [];

  // checks for missing sheets or lacking rows are early-return cases
  let sheetCheck = checkSheets(workbook);
  if (sheetCheck.length) {
    errors.push(
      `Workbook is missing required sheet${
        sheetCheck.length > 1 ? 's' : ''
      }: ${sheetCheck.join(', ')}.`,
    );
    return { errors, warnings };
  }

  if (!data.length) {
    errors.join.push(`Found no rows on the data sheet`);
    return { errors, warnings };
  }

  // other checks
  const dateCheckResult = checkDateFormat (data, workbook, numericDateFormatConverted);

  if (dateCheckResult) {
    if (dateCheckResult.error) {
      errors.push(dateCheckResult.error);
    }
    if (dateCheckResult.warning) {
      warnings.push(dateCheckResult.warning);
    }
  }

  const check1904DateFormat = is1904Format (workbook);
  if (check1904DateFormat) {
    warnings.push (messages.is1904Error)
  }

  let missingCols = checkRequiredCols(data);
  if (missingCols.length) {
    errors.push(
      `Data sheet is missing required column${
        missingCols.length > 1 ? 's' : ''
      }: ${missingCols.join(', ')}`,
    );
  }

  let fixedVariables = new Set(['time', 'lat', 'lon', 'depth']);
  let userVariables = new Set(
    Object.keys(data[0]).filter((key) => !fixedVariables.has(key)),
  );

  let variableNameMismatches = checkVariableNameMismatches(
    data,
    vars_meta_data,
    userVariables,
  );
  if (variableNameMismatches.length) {
    errors.push(
      `The following value${variableNameMismatches.length > 1 ? 's' : ''} ` +
        `for var_short_name on the vars_meta_data sheet did not match a column header on the data sheet:\n` +
        `${variableNameMismatches.join(', ')}.`,
    );
  }

  let missingVarMetadataRows = checkMissingVarMetadataRows(
    data,
    vars_meta_data,
    userVariables,
  );
  if (missingVarMetadataRows.length) {
    errors.push(
      `The following column header${
        missingVarMetadataRows.length > 1 ? 's' : ''
      } on the data sheet ` +
        `did not match any value for var_short_name on the vars_meta_data sheet: \n` +
        `${missingVarMetadataRows.join(', ')}.`,
    );
  }

  let emptyColumns = checkEmptyColumns(data, userVariables);
  if (emptyColumns.length) {
    errors.push(
      `The column${emptyColumns.length > 1 ? 's' : ''} ${emptyColumns.join(
        ', ',
      )} contain${emptyColumns > 1 ? '' : 's'} no values.`,
    );
  }

  if (!checkDepthAllOrNone(data)) {
    errors.push(
      'The depth column on the data sheet must contain a value for every row, or be empty.',
    );
  }

  if (datasetMetadataIncludesSampleRow(dataset_meta_data)) {
    errors.push(
      'The value "< short name of your dataset (<50 chars) >" was found in the dataset_short_name column ' +
        'of the dataset_meta_data sheet. Please delete the template sample row and re-select the workbook by clicking ' +
        '"select a different file" above.',
    );
  }

  if (variableMetadataIncludesSampleRow(vars_meta_data)) {
    errors.push(
      'The value "< variable short name (<50 chars) >" was found in the var_short_name column ' +
        'of the vars_meta_data sheet. Please delete the template sample row and re-select the workbook by clicking ' +
        '"select a different file" above.',
    );
  }

  if (checkMultipleCruisesOneCell(dataset_meta_data)) {
    warnings.push(
      `The cruise_names column of the dataset_meta_data sheet may contain multiple cruises in one cell. Please separate ` +
        `cruise names beyond the first into separate rows in this column.`,
    );
  }

  if (checkMissingCruiseNames(dataset_meta_data, vars_meta_data)) {
    warnings.push(
      `The supplied values for make and sensor suggest that some or all of your data may ` +
        `have been gathered on a scientific cruise, but no values were included for cruise_names in the dataset_meta_data sheet. ` +
        `Including cruise names will improve the discoverability of your data.`,
    );
  }

  if (checkRadians(data)) {
    warnings.push(
      `Values supplied for lat and lon indicate the possible use of radian as unit of measurement.` +
        `Lat and lon must be in degrees north and degrees east, respectively.`,
    );
  }

  let duplicates = checkUniqueSpaceTime(data);
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

  return { errors, warnings };
};
