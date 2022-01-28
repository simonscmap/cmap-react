import temporalResolutions from '../../../enums/temporalResolutions';
import depthUtils from '../../../Utility/depthCounter';

export const dayToDate = (min, days) => {
  let value = new Date(min);
  value.setDate(value.getDate() + days);

  let month = value.getMonth() + 1;
  month = month > 9 ? month : '0' + month;

  let day = value.getDate();
  day = day > 9 ? day : '0' + day;

  return `${value.getFullYear()}-${month}-${day}`;
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
  let { Lon_Max, Lon_Min } = parseDataset;
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

  return [ subsetDataPoints, totalDataPoints];
};

// ensure that certain fields are expected parseable type
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

  dates.forEach((field) => {
    try {
      data[field] = Date.parse(dataset[field]);
    } catch (e) {
      let message = `failed to parse ${field} as Date; received ${dataset[field]}`;
      throw new Error(message);
    }
  });

  return data;
};
