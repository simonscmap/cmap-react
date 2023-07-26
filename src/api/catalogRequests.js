// api requests specific to the catalog page
import { apiUrl, fetchOptions } from './config';
import { fetchAndParseCSVData } from './apiHelpers';
import logInit from '../Services/log-service';
const log = logInit('catalogRequests');

const catalogAPI = {};

catalogAPI.datasets = async () => {
  let endpoint = apiUrl + '/api/catalog/datasets';

  return fetchAndParseCSVData({
    endpoint,
    options: {
      fetchOptions,
      collectorType: 'keyValue',
    },
    collector: (target, record) =>
      (target[record.Dataset_Long_Name.trim()] = record),
  });
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

catalogAPI.datasetVariablesFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetvariables?shortname=${shortname}`,
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
    response = await fetch(
      apiUrl + `/api/data/dataset-features`,
      fetchOptions,
    );
  } catch (e) {
    log.warn ('error fetching ci datasets', e);
    return null;
  }

  return await response.json();
};

export default catalogAPI;
