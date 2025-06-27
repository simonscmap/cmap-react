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

// with sp params, ask for a sql string back from api
visualizationAPI.storedProcedureSQLify = async (payload) => {
  const params = payload.parameters;
  params.sqlify = true;

  const response = await fetch(
    apiUrl +
      '/api/data/sp?' +
      storedProcedureParametersToUri(payload.parameters),
    fetchOptions,
  );

  if (!response.ok) {
    return { failed: true, status: response.status };
  } else {
    return await response.json();
  }
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
  vizData.csvDownloadArgs = {
    datasetShortName: vizData.metadata.Short_Name,
    variableShortName: vizData.metadata.Variable,
    variableLongName: vizData.metadata.Long_Name,
  };
  return vizData;
};

visualizationAPI.variableSampleVisRequest = async (payload) => {
  const { variableData, datasetShortName } = payload;
  const { ID } = variableData;
  const { visType, parameters, metadata } = variableData.meta;

  let dataModel;
  switch (visType) {
    case 'Heatmap':
      dataModel = new SpaceTimeData({ parameters, metadata });
      break;
    case 'Sparse':
      dataModel = new SparseData({ parameters, metadata });
      break;
    default:
      dataModel = null;
  }

  if (!dataModel) {
    return { failed: true, status: 'NO DATA MODEL IDENTIFIED' };
  }

  const decoder = new encoding.TextDecoder();

  const url = `${apiUrl}/api/catalog/variable-sample-visualization?varId=${ID}&shortname=${datasetShortName}`;

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (e) {
    console.log('variable sample vis request failed', { url });
    return { failed: true, status: response && response.status };
  }

  if (!response.ok) {
    return { failed: true, status: response.status };
  }

  let csvParser = CSVParser({ from: 2 });

  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      dataModel.add(record);
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

  // Add csvDownloadArgs to dataModel
  dataModel.csvDownloadArgs = {
    datasetShortName,
    variableShortName: metadata.Short_Name,
    variableLongName: metadata.Long_Name,
  };

  return dataModel;
};

// deprecated
visualizationAPI.datasetDetailPageVariableVisualizationRequest = async (
  payload,
) => {
  const { variableData } = payload;
  const { meta } = variableData;
  const { visType, parameters, metadata } = meta;

  let dataModel;
  switch (visType) {
    case 'Heatmap':
      dataModel = new SpaceTimeData({ parameters, metadata });
      break;
    case 'Sparse':
      dataModel = new SparseData({ parameters, metadata });
      break;
    default:
      dataModel = null;
  }

  if (!dataModel) {
    return { failed: true, status: 'NO DATA MODEL IDENTIFIED' };
  }

  const decoder = new encoding.TextDecoder();
  const api = visType === 'Heatmap' ? 'sp' : 'query';
  const qsStart = visType === 'Sparse' ? 'query=' : '';
  const url = `${apiUrl}/api/data/${api}?${qsStart}${encodeURI(meta.query)}`;

  let response = await fetch(url, fetchOptions);

  if (!response.ok) {
    return { failed: true, status: response.status };
  }

  let csvParser = CSVParser({ from: 2 });

  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      dataModel.add(record);
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

  return dataModel;
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
    response = await fetch(endpoint, {
      ...postOptions,
      body: JSON.stringify({ cruise_ids: payload.ids }),
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
      },
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
    Object.assign(trajectories[key], analyzeTrajectory(trajectories[key]));
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
    console.error('incorrect args for csv metadata download request');
    return { failed: true, status: 'not sent' };
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

const safeAPI = Object.entries(visualizationAPI)
  .map(([name, fn]) => {
    return {
      [name]: async (...args) => {
        let result;
        // console.log(`<trace::vizApi> ${name}`);
        try {
          result = await fn.apply(null, args);
        } catch (e) {
          if (e) {
            result = e;
          } else {
            result = new Error(
              'unknown error, the request may not have been sent',
            );
          }
        }
        return await result;
      },
    };
  })
  .reduce((accumulator, current) => {
    return {
      ...accumulator,
      ...current,
    };
  }, {});

export default safeAPI;
