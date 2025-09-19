// api requests specific to the catalog page
import { apiUrl, postOptions } from '../../../api/config';
import safeApi from '../../../api/safeApi';
import logInit from '../../../Services/log-service';
import { transformFiltersForAPI } from '../../../shared/filtering/utils';
const log = logInit('bulk-download');

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
 * @param {Object} filters - Optional filter criteria with the following structure:
 * @param {boolean} filters.Time_Min - Flag indicating if temporal filtering is enabled
 * @param {Date|string} filters.timeStart - Start date (Date object or ISO string)
 * @param {Date|string} filters.timeEnd - End date (Date object or ISO string)
 * @param {number|string} filters.latStart - Minimum latitude (-90 to 90)
 * @param {number|string} filters.latEnd - Maximum latitude (-90 to 90)
 * @param {number|string} filters.lonStart - Minimum longitude (-180 to 180)
 * @param {number|string} filters.lonEnd - Maximum longitude (-180 to 180)
 * @param {number|string} filters.depthStart - Minimum depth
 * @param {number|string} filters.depthEnd - Maximum depth
 *
 * API Request Body (after transformation):
 * {
 *   shortNames: Array<string>,
 *   filters?: {
 *     temporal?: { startDate: string, endDate: string },    // ISO date strings (YYYY-MM-DD)
 *     spatial?: { latMin: number, latMax: number, lonMin: number, lonMax: number },
 *     depth?: { min: number, max: number }
 *   }
 * }
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
    if (response.status === 413) {
      const error = new Error(
        'Request too large. Please apply filters to reduce the size of your download.',
      );
      error.status = 413;
      throw error;
    }
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
 * @param {Object} filters - Optional filter criteria with the following structure:
 * @param {boolean} filters.Time_Min - Flag indicating if temporal filtering is enabled
 * @param {Date|string} filters.timeStart - Start date (Date object or ISO string)
 * @param {Date|string} filters.timeEnd - End date (Date object or ISO string)
 * @param {number|string} filters.latStart - Minimum latitude (-90 to 90)
 * @param {number|string} filters.latEnd - Maximum latitude (-90 to 90)
 * @param {number|string} filters.lonStart - Minimum longitude (-180 to 180)
 * @param {number|string} filters.lonEnd - Maximum longitude (-180 to 180)
 * @param {number|string} filters.depthStart - Minimum depth
 * @param {number|string} filters.depthEnd - Maximum depth
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Object with dataset names as keys and row counts as values
 *
 * API Request Body (after transformation):
 * {
 *   shortNames: Array<string>,
 *   filters?: {
 *     temporal?: { startDate: string, endDate: string },    // ISO date strings (YYYY-MM-DD)
 *     spatial?: { latMin: number, latMax: number, lonMin: number, lonMax: number },
 *     depth?: { min: number, max: number }
 *   }
 * }
 */
bulkDownloadAPI.getRowCounts = async (
  datasetShortNames,
  filters = null,
  signal = null,
) => {
  log.debug('getting row counts', { datasetShortNames, filters });
  const endpoint = apiUrl + `/api/data/bulk-download-row-counts`;

  const requestBody = { shortNames: datasetShortNames };

  if (filters) {
    requestBody.filters = transformFiltersForAPI(filters);
  }

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  // Add abort signal if provided
  if (signal) {
    fetchOptions.signal = signal;
  }

  const response = await fetch(endpoint, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `Failed to get row counts: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

/**
 * Initialize bulk download feature by getting datasets metadata
 * @param {Array<string>} datasetShortNames - Array of dataset short names
 * @returns {Promise<Object>} Object containing datasets metadata
 */
bulkDownloadAPI.initBulkDownload = async (datasetShortNames) => {
  log.debug('initializing bulk download', { datasetShortNames });
  const endpoint = apiUrl + `/api/data/bulk-download-init`;

  const requestBody = { shortNames: datasetShortNames };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to initialize bulk download: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export default safeApi(bulkDownloadAPI);
