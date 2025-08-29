// api requests specific to the catalog page
import { apiUrl, postOptions } from './config';
import safeApi from './safeApi';
import logInit from '../Services/log-service';
import { dayToDateString } from '../shared/filtering/utils/dateHelpers';
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

/**
 * Trigger a browser download from blob data
 * @param {Blob} blob - The blob containing the download data
 * @param {string} filename - Name for the downloaded file
 */
const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const bulkDownloadAPI = {};

/**
 * Download datasets as files using fetch API
 * @param {Array<string>} datasetShortNames - Array of dataset short names
 * @param {Object} filters - Optional filter criteria
 */
bulkDownloadAPI.downloadData = async (datasetShortNames, filters = null) => {
  log.debug('starting bulk download', { datasetShortNames, filters });
  const endpoint = apiUrl + `/api/data/bulk-download`;

  const requestBody = { shortNames: datasetShortNames };

  if (filters) {
    requestBody.filters = transformFiltersForAPI(filters);
  }

  const response = await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }

  // Get the blob from the response
  const blob = await response.blob();

  // Generate a filename (you might want to get this from response headers)
  const filename = `datasets_${Date.now()}.zip`;

  // Trigger the download
  triggerBlobDownload(blob, filename);
};

/**
 * Get row counts for datasets with optional filters
 * @param {Array<string>} datasetShortNames - Array of dataset short names
 * @param {Object} filters - Optional filter criteria
 * @returns {Promise<Object>} Object with dataset names as keys and row counts as values
 */
bulkDownloadAPI.getRowCounts = async (datasetShortNames, filters = null) => {
  log.debug('getting row counts', { datasetShortNames, filters });
  const endpoint = apiUrl + `/api/data/bulk-download-row-counts`;

  const requestBody = { shortNames: datasetShortNames };

  if (filters) {
    requestBody.filters = transformFiltersForAPI(filters);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get row counts: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export default safeApi(bulkDownloadAPI);
