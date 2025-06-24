import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import XLSX from 'xlsx';
import api from '../../../api/api';
import datasetMetadataToDownloadFormat from '../../../Utility/Catalog/datasetMetadataToDownloadFormat';
import store from '../../../Redux/store';
import * as interfaceActions from '../../../Redux/actions/ui';
import initLog from '../../../Services/log-service';

const log = initLog('catalog/dataRequest');

// make dataset and metadata requests in parallel
export const fetchDatasetAndMetadata = async ({ query, shortName }) => {
  // to try/catch
  let requests = [
    fetchDatasetMetadata(shortName),
    new Promise((resolve, reject) => {
      let response;
      (async () => {
        try {
          response = await api.data.customQuery(query);
        } catch (e) {
          log.error('custom query failed', { error: e, shortName });
          reject(e);
          return;
        }

        if (response.ok) {
          resolve(response);
        } else {
          reject(response);
        }
      })();
    }),
  ];

  let metadataJSON, datasetResp;
  try {
    [metadataJSON, datasetResp] = await Promise.all(requests);
  } catch (eResp) {
    let { status } = eResp;
    log.warn('error in data request', { status, originalError: eResp });
    if (status === 401) {
      throw new Error('UNAUTHORIZED', { cause: eResp });
    } else if (status === 400) {
      let responseText = await eResp.text();
      let errorMessage =
        responseText === 'query exceeds maximum size allowed'
          ? '400 TOO LARGE'
          : 'BAD REQUEST';
      throw new Error(errorMessage, { cause: eResp });
    } else {
      throw new Error('ERROR', { cause: eResp });
    }
  }

  let datasetText;
  try {
    console.log('about to marshall response', datasetResp);
    datasetText = await datasetResp.arrayBuffer();
  } catch (e) {
    console.error('error marshalling response text');
    console.log(e);
  }

  /* if (!datasetText || datasetText.length === 0) {
   *   console.log('datasetText length', datasetText.length);
   *   console.error('no response text for dataset');
   *   store.dispatch()
   *   return;
   * } */

  return [metadataJSON, datasetText];
};

// Fetch just the metadata for a dataset
export const fetchDatasetMetadata = async (shortName) => {
  try {
    const response = await api.catalog.datasetMetadata(shortName);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED', { cause: response });
      } else {
        throw new Error('ERROR', { cause: response });
      }
    }

    const metadataJSON = await response.json();
    return metadataJSON;
  } catch (e) {
    log.error('dataset metadata fetch failed', { error: e, shortName });
    throw e;
  }
};

// Filter metadata for a specific variable
export const filterMetadataForVariable = (metadata, variableName) => {
  if (!metadata || !metadata.variables) {
    return null;
  }

  // Create a copy of the metadata object
  const filteredMetadata = {
    ...metadata,
    variables: metadata.variables.filter((v) => v.Variable === variableName),
  };

  // If no matching variable was found, return null
  if (filteredMetadata.variables.length === 0) {
    return null;
  }

  return filteredMetadata;
};

export const makeMetadataWorkbook = (metadataJSON) => {
  // marshal metadata into xlsx
  let fullPageData = datasetMetadataToDownloadFormat(metadataJSON);
  let workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.datasetRows),
    'Dataset Metadata',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.variableRows),
    'Variable Metadata',
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(fullPageData.summaryStatisticsRows),
    'Variable Summary Statistics',
  );

  // create blob from workbook
  let metadataBlob = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
  });

  return metadataBlob;
};

// data -> fileName -> shortName -> void ()
// creates zip and initiates save in browser
export const makeZip = (data, fileName, shortName) => {
  let [metadataJSON, datasetText] = data;
  const z = new JSZip();

  let metadataBlob = makeMetadataWorkbook(metadataJSON);

  // add metadata and dataset to zip
  z.file(`${shortName}_metadata.xlsx`, metadataBlob);
  z.file(`${shortName}.csv`, datasetText);

  // save zip (opens download dialog for user
  z.generateAsync({ type: 'blob' }).then(
    (blob) => {
      store.dispatch(interfaceActions.setLoadingMessage(''));
      saveAs(blob, `${fileName}.zip`);
    },
    (err) => {
      console.error('error', err);
    },
  );
};
