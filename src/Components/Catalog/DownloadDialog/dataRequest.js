import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import XLSX from 'xlsx';
import api from '../../../api/api';
import datasetMetadataToDownloadFormat from '../../../Utility/Catalog/datasetMetadataToDownloadFormat';
import store from '../../../Redux/store';
import * as interfaceActions from '../../../Redux/actions/ui';

// make dataset and metadata requests in parallel
export const fetchDatasetAndMetadata = async ({ query, shortName }) => {
  // to try/catch
  let requests = [
    new Promise(async (resolve, reject) => {
      let response = await api.catalog.datasetFullPageDataFetch(shortName);
      if (response.ok) {
        resolve(response);
      } else {
        reject(response);
      }
    }),
    new Promise(async (resolve, reject) => {
      let response = await api.data.customQuery(query);
      if (response.ok) {
        resolve(response);
      } else {
        reject(response);
      }
    }),
  ];

  let metadataResp, datasetResp;
  try {
    [metadataResp, datasetResp] = await Promise.all(requests);
  } catch (eResp) {
    let errorMessage = eResp.status === 401 ? 'UNAUTHORIZED' : 'ERROR';
    throw new Error(errorMessage, { cause: eResp });
  }



  // get data in correct format
  let metadataJSON = await metadataResp.json();
  let datasetText = datasetResp.text();

  return [metadataJSON, datasetText];
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
  z.file(`${fileName}.csv`, datasetText);

  // save zip (opens download dialog for user
  z.generateAsync({ type: 'blob' }).then(
    (blob) => {
      store.dispatch(interfaceActions.setLoadingMessage(''))
      saveAs(blob, `${fileName}.zip`);
    },
    (err) => {
      console.error('error', err);
    },
  );
};
