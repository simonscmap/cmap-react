// api requests specific to the catalog page
import { apiUrl, fetchOptions } from './config';
// import { fetchAndParseCSVData } from './apiHelpers';
import logInit from '../Services/log-service';
const log = logInit('catalogRequests');

const catalogAPI = {};

catalogAPI.datasetNames = async () => {
  const endpoint = apiUrl + '/api/catalog/dataset-names';
  return await fetch(endpoint, fetchOptions);
};

catalogAPI.submissionOptions = async () => {
  return await fetch(apiUrl + '/api/catalog/submissionoptions');
};

catalogAPI.searchResults = async (queryString) => {
  return await fetch(
    apiUrl + '/api/catalog/searchcatalog' + queryString,
    fetchOptions,
  );
};

catalogAPI.fetchKeywords = async () => {
  return await fetch(apiUrl + '/api/catalog/keywords');
};

// used for the dataset page
// fullpage data returns Dasaset info and Cruises
// Dataset info resolves any enum values from reference tables
// and pulls in dataset stats for spacetime min/max data,
// row count, keywords, regions, visualizable flag
// sensors and unstructure metadata
catalogAPI.datasetFullPageDataFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetfullpage?shortname=${shortname}`,
    fetchOptions,
  );
};

// dataset, variables, metadata
// used for dataset download
catalogAPI.datasetMetadata = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetmetadata?shortname=${shortname}`,
    fetchOptions,
  );
};

// used to populate variables table in dataset detail page
// api calls uspVariableCatalog
catalogAPI.datasetVariablesFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetvariables?shortname=${shortname}`,
    fetchOptions,
  );
};

catalogAPI.datasetVisualizableVariablesFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/visualizable-variables?shortname=${shortname}`,
    fetchOptions,
  );
};

catalogAPI.datasetVariableUMFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetvariableum?shortname=${shortname}`,
    fetchOptions,
  );
};

catalogAPI.cruiseFullPageDataFetch = async (name) => {
  return await fetch(
    apiUrl + `/api/catalog/cruisefullpage?name=${name}`,
    fetchOptions,
  );
};

catalogAPI.cruiseSearch = async (qString) => {
  return await fetch(
    apiUrl + `/api/catalog/searchcruises` + qString,
    fetchOptions,
  );
};

catalogAPI.getDatasetFeatures = async () => {
  let response;
  try {
    response = await fetch(apiUrl + `/api/data/dataset-features`, fetchOptions);
  } catch (e) {
    log.warn('error fetching ci datasets', e);
    return null;
  }
  try {
    return await response.json();
  } catch (e) {
    return e;
  }
};

catalogAPI.fetchPopularDatasets = async () => {
  let response;
  try {
    response = await fetch(
      apiUrl + `/api/catalog/popular-datasets`,
      fetchOptions,
    );
  } catch (e) {
    log.warn('error fetching popular datasets', e);
    return e;
  }

  try {
    return await response.json();
  } catch (e) {
    return e;
  }
};

catalogAPI.fetchRecentDatasets = async (user_id) => {
  let response;
  try {
    response = await fetch(
      apiUrl + `/api/catalog/recent-datasets?user_id=${user_id}`,
      fetchOptions,
    );
  } catch (e) {
    log.warn('error fetching recent datasets', e);
    return e;
  }

  try {
    return await response.json();
  } catch (e) {
    return e;
  }
};

catalogAPI.fetchRecommendedDatasets = async (user_id) => {
  let response;
  try {
    response = await fetch(
      apiUrl + `/api/catalog/recommended-datasets?user_id=${user_id}`,
      fetchOptions,
    );
  } catch (e) {
    log.warn('error fetching recommended datasets', e);
    return e;
  }

  try {
    return await response.json();
  } catch (e) {
    return e;
  }
};

catalogAPI.fetchPrograms = async () => {
  return await fetch(apiUrl + '/api/catalog/programs');
};

catalogAPI.fetchProgramDetails = async (programName) => {
  return await fetch(
    apiUrl + '/api/catalog/programs/' + programName + '?downSample=true',
  );
};

// Wrap each endpoint in a try/catch because...
// if the fetch fails before the request is sent, for example due to a CORS
// violation or if the network is down,
// then redux-saga will choke and no subsequent middleware will run,
// effectively crippling the application.
// yay error eandling.

let safeAPI = Object.entries(catalogAPI)
  .map(([name, fn]) => {
    return {
      [name]: async (...args) => {
        let result;
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
