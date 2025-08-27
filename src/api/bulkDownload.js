// api requests specific to the catalog page
import {
  apiUrl,
  // postOptions,
  // fetchOptions
} from './config';
import safeApi from './safeApi';
import logInit from '../Services/log-service';
const log = logInit('bulk-download');

/**
 * Transform filters from Zustand format to API format
 * @param {Object} filters - Filter object from Zustand store
 * @returns {Object} - API-compatible filter object
 */
const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - use startDate/endDate for API compatibility
  if (filters.temporal) {
    apiFilters.temporal = {
      startDate: filters.temporal.startDate,
      endDate: filters.temporal.endDate,
    };
  }

  // Transform spatial filters - lat/lon already in API format
  if (filters.spatial) {
    apiFilters.spatial = {
      latStart: filters.spatial.latStart,
      latEnd: filters.spatial.latEnd,
      lonStart: filters.spatial.lonStart,
      lonEnd: filters.spatial.lonEnd,
    };
  }

  // Transform depth filters - already in API format
  if (filters.depth) {
    apiFilters.depth = {
      depthStart: filters.depth.depthStart,
      depthEnd: filters.depth.depthEnd,
    };
  }

  return apiFilters;
};

const bulkDownloadAPI = {};

bulkDownloadAPI.post = async (datasetShortNames, filters = null) => {
  log.debug('starting bulk download', { datasetShortNames, filters });
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

  if (filters) {
    const apiFilters = transformFiltersForAPI(filters);
    const filtersField = document.createElement('input');
    filtersField.setAttribute('type', 'hidden');
    filtersField.setAttribute('name', 'filters');
    filtersField.setAttribute('value', JSON.stringify(apiFilters));
    form.appendChild(filtersField);
  }

  document.body.appendChild(form);
  form.submit();
  // cleanup
  document.body.removeChild(form);
};

export default safeApi(bulkDownloadAPI);
