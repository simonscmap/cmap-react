// api requests specific to the catalog page
import { apiUrl, fetchOptions } from './config';
import CSVParser from 'csv-parse';
import encoding from 'text-encoding';
import { fetchAndParseCSVData } from './apiHelpers';

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

// use specific api route for feching list of ancillary datasets
// in order to bypass the auth check on other data routes
catalogAPI.getTableWithAncillaryData = async () => {
  let data = [];
  const decoder = new encoding.TextDecoder();

  let csvParser = CSVParser({ columns: true });
  csvParser.on('readable', function () {
    let record;
    while ((record = csvParser.read())) {
      data.push(record);
    }
  });

  let response = await fetch(
    apiUrl + '/api/data/ancillary-datasets',
    fetchOptions,
  );

  if (!response.ok) {
    return false;
  }

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
  return data;
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

// used to get metadata
catalogAPI.datasetFullPageDataFetch = async (shortname) => {
  return await fetch(
    apiUrl + `/api/catalog/datasetfullpage?shortname=${shortname}`,
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

export default catalogAPI;
