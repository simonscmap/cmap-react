// api requests specific to the catalog page
import {
  apiUrl,
  // postOptions,
  // fetchOptions
} from './config';
import safeApi from './safeApi';
import logInit from '../Services/log-service';
import { dayToDateString } from '../shared/filtering/dateHelpers';
const log = logInit('bulk-download');

/**
 * Transform filters from Zustand format to API format
 * @param {Object} filters - Filter object from Zustand store
 * @returns {Object} - API-compatible filter object
 */
const transformFiltersForAPI = (filters) => {
  const apiFilters = {};

  // Transform temporal filters - use Time_Min and dayToDateString
  if (filters.Time_Min) {
    apiFilters.temporal = {
      startDate: dayToDateString(filters.Time_Min, filters.timeStart),
      endDate: dayToDateString(filters.Time_Min, filters.timeEnd),
    };
  }

  // Transform spatial filters - map to API format
  if (
    filters.latStart !== undefined ||
    filters.latEnd !== undefined ||
    filters.lonStart !== undefined ||
    filters.lonEnd !== undefined
  ) {
    apiFilters.spatial = {
      latMin: filters.latStart,
      latMax: filters.latEnd,
      lonMin: filters.lonStart,
      lonMax: filters.lonEnd,
    };
  }

  // Transform depth filters - map to API format
  if (filters.depthStart !== undefined || filters.depthEnd !== undefined) {
    apiFilters.depth = {
      min: filters.depthStart,
      max: filters.depthEnd,
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
