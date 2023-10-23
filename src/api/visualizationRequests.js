// api requests specific to the visualization page

import CSVParser from 'csv-parse';
import encoding from 'text-encoding';
import { sparseDataQueryFromPayload } from '../Components/Visualization/helpers';
import storedProcedures from '../enums/storedProcedures';
import { apiUrl, fetchOptions, postOptions } from './config';
import DepthProfileData from './DepthProfileData';
import SectionMapData from './SectionMapData';
import SpaceTimeData from './SpaceTimeData';
import SparseData from './SparseData';
import TimeSeriesData from './TimeSeriesData';
import analyzeTrajectory from '../Components/Visualization/helpers/analyzeTrajectory';

const storedProcedureParametersToUri = (parameters) => {
  let result = Object.keys(parameters).reduce(function (queryString, key, i) {
    return `${queryString}${i === 0 ? '' : '&'}${key}=${parameters[key]}`;
  }, '');
  return result;
};

const visualizationAPI = {};

visualizationAPI.storedProcedureRequest = async (payload) => {
  const decoder = new encoding.TextDecoder();
  var vizData;

  switch (payload.parameters.spName) {
    case storedProcedures.spaceTime:
      if (payload.subType === 'Sparse') {
        vizData = new SparseData(payload);
      } else {
        vizData = new SpaceTimeData(payload);
      }
      break;

    case storedProcedures.timeSeries:
      vizData = new TimeSeriesData(payload);
      break;

    case storedProcedures.depthProfile:
      vizData = new DepthProfileData(payload);
      break;

    case storedProcedures.sectionMap:
      vizData = new SectionMapData(payload);
      break;

    default:
      console.log('Unknown sproc name');
  }

  let response = await fetch(
    apiUrl +
      '/api/data/sp?' +
      storedProcedureParametersToUri(payload.parameters),
    fetchOptions,
  );

  if (!response.ok) {
    return { failed: true, status: response.status };
  }

  let csvParser = CSVParser({ from: 2 });

  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      vizData.add(record);
    }
  });

  csvParser.on('error', (e) => {
    console.log(e);
  });

  let body = response.body;
  let reader = body.getReader();
  let readerIsDone = false;

  while (!readerIsDone) {
    let chunk = await reader.read();
    if (chunk.done) {
      readerIsDone = true;
    } else {
      csvParser.write(decoder.decode(chunk.value));
    }
  }

  return vizData;
};

visualizationAPI.sparseDataQuerysend = async (payload) => {
  const { parameters } = payload;

  const decoder = new encoding.TextDecoder();
  var vizData;

  // build the query
  let query = sparseDataQueryFromPayload(payload);

  switch (parameters.spName) {
    case storedProcedures.spaceTime:
      if (payload.subType === 'Sparse') {
        vizData = new SparseData(payload);
      } else {
        vizData = new SpaceTimeData(payload);
      }
      break;

    default:
      console.log('Unknown sproc name');
  }

  // let response = await fetch(apiUrl + '/api/data/sp?' + storedProcedureParametersToUri(payload.parameters), fetchOptions);
  let response = await fetch(
    apiUrl + '/api/data/query?query=' + encodeURI(query),
    fetchOptions,
  );

  if (!response.ok) {
    return { failed: true, status: response.status };
  }

  let csvParser = CSVParser({ from: 2 });

  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      vizData.add(record);
    }
  });

  csvParser.on('error', (e) => {
    console.log(e);
  });

  let body = response.body;
  let reader = body.getReader();
  let readerIsDone = false;

  while (!readerIsDone) {
    let chunk = await reader.read();
    if (chunk.done) {
      readerIsDone = true;
    } else {
      csvParser.write(decoder.decode(chunk.value));
    }
  }

  return vizData;
};

visualizationAPI.getTableStats = async (tableName) => {
  let response = await fetch(
    apiUrl + '/dataretrieval/tablestats?table=' + tableName,
    fetchOptions,
  );
  if (!response.ok) {
    return { failed: true, status: response.status };
  }
  return await response.json();
};

visualizationAPI.cruiseTrajectoryRequest = async (payload) => {
  const endpoint = `${apiUrl}/api/data/cruise-trajectories`;
  // fetch cruise trajectories
  let response;
  try {
    response = await fetch (endpoint, {
      ...postOptions,
      body: JSON.stringify({ cruise_ids: payload.ids })
    });
  } catch (e) {
    return { failed: true, status: response.status };
  }
  // marshal json
  let result;
  if (response.ok) {
    result = await response.json();
  } else {
    return false;
  }

  // divide rows into a single object, with trajectory data
  // organized by cruise id
  let accumulator = payload.ids.reduce((acc, curr) => {
    return Object.assign(acc, {
      [curr]: {
        lats: [],
        lons: [],
        times: [],
      }
    });
  }, {});

  const trajectories = result.reduce((acc, curr) => {
    acc[curr.Cruise_ID].lats.push(curr.lat);
    acc[curr.Cruise_ID].lons.push(curr.lon);
    acc[curr.Cruise_ID].times.push(curr.time);
    return acc;
  }, accumulator);


  // ammend trajectories with center/maxDistance data
  Object.keys(trajectories).forEach((key) => {
    Object.assign(trajectories[key], analyzeTrajectory (trajectories[key]));
  });

  return trajectories;
};

visualizationAPI.cruiseList = async () => {
  let response = await fetch(apiUrl + '/api/data/cruiselist', fetchOptions);

  if (response.ok) {
    return await response.json();
  } else {
    return false;
  }
};

// this fetches metadata that is included in the csv file1
visualizationAPI.csvDownload = async (query) => {
  if (!query) {
    console.error ('incorrect args for csv metadata download request');
    return { failed: true, status: 'not sent'};
  }
  let response = await fetch(
    apiUrl + `/api/data/query?query=${query}`,
   fetchOptions,
  );

  if (response.ok) {
    // hand off data to saga "downloadTextAsCsv"
    return await response.text();
  } else {
    return { failed: true, status: response.status };
  }
};

visualizationAPI.memberVariablesFetch = async (datasetID) => {
  return await fetch(
    apiUrl + `/api/catalog/membervariables?datasetID=${datasetID}`,
  );
};

visualizationAPI.autocompleteVariableNamesFetch = async (terms) => {
  return await fetch(
    apiUrl + `/api/catalog/autocompletevariablesnames?searchTerms=${terms}`,
  );
};

visualizationAPI.variableSearch = async (qString) => {
  return await fetch(
    apiUrl + `/api/catalog/variablesearch${qString}`,
    fetchOptions,
  );
};

visualizationAPI.variableFetch = async (id) => {
  return await fetch(apiUrl + `/api/catalog/variable?id=${id}`, fetchOptions);
};

visualizationAPI.datasetSummaryFetch = async (id) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetsummary?id=${id}`,
    fetchOptions,
  );
};

export default visualizationAPI;
