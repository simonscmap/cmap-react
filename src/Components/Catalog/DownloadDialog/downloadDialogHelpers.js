import temporalResolutions from '../../../enums/temporalResolutions';
import depthUtils from '../../../Utility/depthCounter';
import logInit from '../../../Services/log-service';

const log = logInit('dowloadDialogHelpers');

const MILLISECONDS_PER_DAY = 86400000;

export const getIsMonthlyClimatology = (temporalResolution) => {
  return Boolean(temporalResolution === temporalResolutions.monthlyClimatology);
};

// Queries

export const makeSubsetQuery = (tableName, selection) => {
  let {
    temporalResolution,
    lonStart,
    lonEnd,
    latStart,
    latEnd,
    timeStart,
    timeEnd,
    // Time_Max,
    Time_Min,
    depthStart,
    depthEnd,
  } = selection;

  let isMonthyClimatology = getIsMonthlyClimatology(temporalResolution);

  let timeUnit = isMonthyClimatology ? 'month' : 'cast(time as date)';

  let toTimeEndISO = (day) => [day]
    .map ((d) => dayToDateString (Time_Min, d))
    .map ((d) => new Date (d))
    .map ((d) => d.toISOString())
    .map ((s) => s.slice(0, 10) + 'T23:59:59Z')
    .shift ()

  const _timeStart = isMonthyClimatology
    ? timeStart
    : dayToDateString(Time_Min, timeStart);
  const _timeEnd = isMonthyClimatology ? timeEnd : toTimeEndISO (timeEnd);

  let query =
    `select * from ${tableName} where ${timeUnit} between '${_timeStart}' and '${_timeEnd}' and ` +
    `lat between ${latStart} and ${latEnd} and ` +
    `lon between ${lonStart} and ${lonEnd}`;

  if (depthEnd) {
    query += ` and depth between ${depthStart} and ${depthEnd}`;
  }

  log.debug('make subset query', {
    isMonthyClimatology,
    timeUnit,
    _timeStart,
    _timeEnd,
    query,
    initialSubsetValues: selection,
  });

  return query;
};

export const makeSubsetQueryWithAncillaryData = (tableName, selection) => {
  /*
sproc template:
[dbo].[uspAddAncillary] @tableName NVARCHAR(MAX),
@dt1 NVARCHAR(MAX) = '', @dt2 NVARCHAR(MAX) = '',
@lat1 NVARCHAR(MAX) = '', @lat2 NVARCHAR(MAX) = '',
@lon1 NVARCHAR(MAX) = '', @lon2 NVARCHAR(MAX) = '',
@depth1 NVARCHAR(MAX) = '', @depth2 NVARCHAR(MAX) = '',
@CIP BIT = 0
 */
  let {
    temporalResolution,
    lonStart,
    lonEnd,
    latStart,
    latEnd,
    timeStart,
    timeEnd,
    // Time_Max,
    Time_Min,
    depthStart,
    depthEnd,
  } = selection;

  let isMonthyClimatology = getIsMonthlyClimatology(temporalResolution);

  // convert to 1-indexed month, if unit of time is month
  const _timeStart = isMonthyClimatology
    ? timeStart
    : dayToDateString(Time_Min, timeStart);
  const _timeEnd = isMonthyClimatology ? timeEnd : dayToDateString(Time_Min, timeEnd);
  // + 'T23:59:59Z'

  // NOTE: the CIP bit at the end is hard coded for the moment
  // NOTE: the dates have to be quoted
  let query =
    `EXEC uspAddAncillary '${tableName}', '${_timeStart}',` +
    `'${_timeEnd}', ${latStart}, ${latEnd}, ${lonStart}, ${lonEnd},` +
    `${depthStart}, ${depthEnd}, ${0}`;
  // This query will be sent to /api/query via the csv download saga

  log.debug('make subset query', {
    isMonthyClimatology,
    _timeStart,
    _timeEnd,
    query,
    initialSubsetValues: selection,
  });
  return query;
};

export const makeFullDatasetQueryWithAncillaryData = (tableName) => {
  return `EXEC uspAddAncillary '${tableName}'`;
};

// given the defined subset, the user option for ancillary data,
// return the custom query string to be used to fetch the dataset
export const makeDownloadQuery = ({
  subsetParams,
  ancillaryData,
  tableName,
}) => {
  if (ancillaryData) {
    // user has requested ancillary data
    if (subsetParams.subsetIsDefined) {
      return makeSubsetQueryWithAncillaryData(tableName, subsetParams);
    } else {
      return makeFullDatasetQueryWithAncillaryData(tableName);
    }
  } else {
    // user has requested no ancillary data, or ancillary data is not available
    if (subsetParams.subsetIsDefined) {
      return makeSubsetQuery(tableName, subsetParams);
    } else {
      return `select%20*%20from%20${tableName}`;
    }
  }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// with the begin and end dates of a dataset,
// calculate the span of days
export const getMaxDays = (dataset) => {
  let endTime = new Date(dataset.Time_Max).getTime();
  let startTime = new Date(dataset.Time_Min).getTime();
  let differenceInMilliseconds = endTime - startTime;
  let intervalInDays = Math.floor(
    differenceInMilliseconds / MILLISECONDS_PER_DAY,
  );

  log.debug('get max days', {
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    intervalInDays,
    interval: differenceInMilliseconds / MILLISECONDS_PER_DAY,
  });
  return intervalInDays;
};

export const getInitialRangeValues = (dataset) => {
  let {
    Lat_Max,
    Lat_Min,
    Lon_Max,
    Lon_Min,
    Time_Min,
    Depth_Max,
    Depth_Min,
  } = dataset;

  let maxDays = getMaxDays(dataset);

  let initialValues = {
    lat: {
      start: Math.floor(Lat_Min * 10) / 10,
      end: Math.ceil(Lat_Max * 10) / 10,
    },
    lon: {
      start: Math.floor(Lon_Min * 10) / 10,
      end: Math.ceil(Lon_Max * 10) / 10,
    },
    time: {
      start: Time_Min ? 0 : 1,
      end: Time_Min ? maxDays : 12,
    },
    depth: {
      start: Math.floor(Depth_Min),
      end: Math.ceil(Depth_Max),
    },
    maxDays,
  };

  return initialValues;
};

export const formatDateString = (year, month, day) => {
  return `${year}-${month}-${day}`;
};

// :: DateString -> Date
// Note a date string is in the format "yyyy-mm-dd"
export const extractDateFromString = (stringDate) => {
  let [year, month, day] = stringDate.split('-');
  const date = new Date(year, parseInt(month) - 1, day);
  return date;
};

export const ensureDateIsWithinInitialBounds = (date, min, max) => {
  let target = date < min ? min : date > max ? max : date;
  return target;
};

// used by start and end date setting events
// initial min/max dates are those provided by dataset
export const getBoundedDateValueFromClickEvent = (
  clickEvent,
  initialMin,
  initialMax,
) => {
  if (!clickEvent.target.value) {
    console.error(`no value in event; expected a string representing a date; received target ${clickEvent && clickEvent.target && clickEvent.target.value}`);
    return;
  }

  // value is formatted YYYY-MM-DD
  let targetDate = extractDateFromString(clickEvent.target.value);

  // calculate new target start date
  let target = ensureDateIsWithinInitialBounds(
    targetDate,
    initialMin,
    initialMax,
  );

  return target;
};

// starting with a min date, return a string representation
// of the date N days later
// :: Date -> Days Int -> Date String
// Note: a Date String is in the format "yyyy-mm-dd"
export const dayToDateString = (min, days) => {
  let value = new Date(min);


  value.setDate(value.getDate() + days);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  let result = formatDateString(fullYear, month, day);

  console.log(min, min.getDate(), days, result)
  return result;
};

export const dateStringToISO = (dateString) => {
  let d = new Date (dateString);
  return d.toISOString();
}

// :: Date -> DateString
export const dateToDateString = (date) => {
  let value = new Date(date);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  let fullYear = value.getFullYear();

  return formatDateString(fullYear, month, day);
};

export const dateToDay = (min, date) =>
  Math.ceil((new Date(date).getTime() - new Date(min).getTime()) / 86400000);

export const getDateRatio = (parsedDataset, timeRange) => {
  let { Temporal_Resolution, Time_Max, Time_Min } = parsedDataset;
  let [subsetTime1, subsetTime2] = timeRange;

  let dateRatio;

  if (Temporal_Resolution === temporalResolutions.monthlyClimatology) {
    dateRatio = (subsetTime2 - subsetTime1 + 1) / 12;
  } else {
    var totalDays = (Time_Max - Time_Min) / 86400000 || 1;
    var subsetDays =
      subsetTime2 - subsetTime1 < 1 ? 1 : subsetTime2 - subsetTime1;
    dateRatio = totalDays > subsetDays ? subsetDays / totalDays : 1;
  }

  return dateRatio;
};

export const getLatRatio = (parsedDataset, latRange) => {
  let { Lat_Max, Lat_Min } = parsedDataset;
  let [subsetLat1, subsetLat2] = latRange;
  let totalLatSize = Lat_Max - Lat_Min || 1;
  let subsetLatSize = subsetLat2 - subsetLat1 || 1 / totalLatSize;
  let latRatio = subsetLatSize / totalLatSize;
  return latRatio;
};

export const getLonRatio = (parsedDataset, lonRange) => {
  let { Lon_Max, Lon_Min } = parsedDataset;
  let [subsetLon1, subsetLon2] = lonRange;
  const totalLonSize = Lon_Max - Lon_Min || 1;
  const subsetLonSize = subsetLon2 - subsetLon1 || 1 / totalLonSize;
  const lonRatio = subsetLonSize / totalLonSize;
  return lonRatio;
};

export const getDepthRatio = (parsedData, depthRange) => {
  let { Depth_Min, Depth_Max, Table_Name } = parsedData;
  let [subsetDepth1, subsetDepth2] = depthRange;

  if (!Depth_Max) {
    return 1;
  }

  let depthMin = parseFloat(Depth_Min);
  let depthMax = parseFloat(Depth_Max);

  let depthRatio;

  if (depthUtils.piscesTable.has(Table_Name)) {
    let depthCount = depthUtils.count(
      { data: parsedData },
      subsetDepth1,
      subsetDepth2,
    );
    depthRatio = depthCount / depthUtils.piscesDepths.length || 1;
  } else if (depthUtils.darwinTable.has(Table_Name)) {
    let depthCount = depthUtils.count(
      { data: parsedData },
      subsetDepth1,
      subsetDepth2,
    );
    depthRatio = depthCount / depthUtils.darwinDepths.length || 1;
  } else {
    var totalDepthSize = depthMax - depthMin || 1;
    var subsetDepthSize = subsetDepth2 - subsetDepth1 || 1;
    depthRatio =
      subsetDepthSize > totalDepthSize ? 1 : subsetDepthSize / totalDepthSize;
  }
  return depthRatio;
};

export const getSubsetDataPointsCount = (parsedDataset, state) => {
  let { Row_Count, Variables, Depth_Max } = parsedDataset;
  let { lat, lon, time, depth } = state;

  // get ratios
  let dateRatio = getDateRatio(parsedDataset, time);
  let latRatio = getLatRatio(parsedDataset, lat);
  let lonRatio = getLonRatio(parsedDataset, lon);
  let depthRatio = getDepthRatio(parsedDataset, depth);

  const variableColumns = Variables && Variables.length;
  const depthColumns = Depth_Max ? 1 : 0;
  const fixedColumns = 3;

  const totalColumns = variableColumns + depthColumns + fixedColumns;

  const totalDataPoints = Row_Count * totalColumns;

  // calculate count of subset data
  const subsetDataPoints = Math.floor(
    totalDataPoints * dateRatio * latRatio * lonRatio * depthRatio,
  );

  return [subsetDataPoints, totalDataPoints];
};

export const getDownloadAvailabilites = (dataset, subsetState) => {
  // calculations used to allow/disallow size of download
  const [subsetDataPointsCount, totalDataPoints] = getSubsetDataPointsCount(
    dataset,
    subsetState,
  );

  // Magic numbers!
  const fullDatasetAvailable = totalDataPoints <= 20000000;
  const subsetAvailable = subsetDataPointsCount <= 20000000;

  const availabilities = {
    fullDatasetAvailable,
    subsetAvailable,
    subsetDataPointsCount,
  };

  return availabilities;
};

// ensure that certain fields are expected parseable type
// NOTE: this is especially important for dates, as this
// parsing also corrects for the client's (browser's) timezone
// so that the dates show up as GMT; all subsequent date calculations
// should be downstream of this correction
export const parseDataset = (dataset) => {
  let data = {
    ...dataset,
  };

  let floats = ['Lat_Min', 'Lat_Max', 'Lon_Min', 'Lon_Max'];
  let dates = ['Time_Min', 'Time_Max'];

  floats.forEach((field) => {
    try {
      data[field] = parseFloat(dataset[field]);
    } catch (e) {
      let message = `failed to parse ${field} as float; received ${dataset[field]}`;
      throw new Error(message);
    }
  });

  // dates are stored as GMT but the date strings don't contain that info,
  // so javascript applies a TZ offset
  // this is tricky, because the offset is correct, but we want to display the
  // date as GMT, so we need to correct the offset
  dates.forEach((field) => {
    let d;
    try {
      if (dataset[field]) {
        d = new Date(dataset[field]);
      }
    } catch (e) {
      let message = `failed to parse ${field} as Date; received ${dataset[field]}`;
      throw new Error(message);
    }

    if (!d) {
      return;
    }

    let offset = d.getTimezoneOffset();
    let offsetHours = offset / 60;
    let offsetMinutes = offset % 60;
    let utcHours = d.getUTCHours();

    d.setUTCHours(utcHours + offsetHours);

    if (offsetMinutes !== 0) {
      d.setUTCMinutes(d.getUTCMinutes + offsetMinutes);
    }

    data[field] = d; // now saving this altered date as a date object
  });

  return data;
};
