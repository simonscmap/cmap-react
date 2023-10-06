// api requests specific to the catalog page
import { apiUrl, postOptions, fetchOptions } from './config';
import safeApi from './safeApi';
import logInit from '../Services/log-service';
const log = logInit('bulk-download');

const bulkDownloadAPI = {};

/* bulkDownloadAPI.download = async (datasetShortNames) => {
*   log.debug ('starting bulk download', { datasetShortNames });
*   const endpoint = apiUrl + '/api/data/bulk-download';
*   await fetch(endpoint, {
*     ...postOptions,
*     body: JSON.stringify(datasetShortNames)
*   });
* }; */
bulkDownloadAPI.download = async (datasetShortNames) => {
  log.debug ('starting bulk download', { datasetShortNames });
  const endpoint = apiUrl + `/api/data/bulk-download?${datasetShortNames.join(',')}`;
  window.open(endpoint, '_blank');
};
export default safeApi(bulkDownloadAPI);
