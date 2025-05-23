// api requests specific to the catalog page
import {
  apiUrl,
  // postOptions,
  // fetchOptions
} from './config';
import safeApi from './safeApi';
import logInit from '../Services/log-service';
const log = logInit('bulk-download');

const bulkDownloadAPI = {};

bulkDownloadAPI.post = async (datasetShortNames) => {
  log.debug('starting bulk download', { datasetShortNames });
  const endpoint = apiUrl + `/api/data/bulk-download`;

  const form = document.createElement('form');
  form.setAttribute('method', 'post');
  form.setAttribute('action', endpoint);
  form.setAttribute('id', 'test-bulk-download-form');

  const hiddenField = document.createElement('input');
  hiddenField.setAttribute('type', 'hidden');
  hiddenField.setAttribute('name', 'shortNames');
  hiddenField.setAttribute('value', JSON.stringify(datasetShortNames));
  form.appendChild(hiddenField);
  document.body.appendChild(form);
  form.submit();
  // cleanup
  document.body.removeChild(form);
};

export default safeApi(bulkDownloadAPI);
