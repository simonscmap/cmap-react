// api requests specific to the catalog page
import { apiUrl, postOptions } from '../../../api/config';
import fetchWithAuth from '../../../api/fetchWithAuth';
import logInit from '../../../Services/log-service';
import { transformFiltersForAPI } from '../../../shared/filtering/utils';
import DownloadService from '../../../shared/services/dataDownload/downloadService';
import { fetchMetadataFromLocalDb } from './localMetadataAdapter';
const log = logInit('bulk-download');

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
 * @param {number|string} collectionId - Optional collection ID (must be positive integer)
 *
 * API Request Body (after transformation):
 * {
 *   shortNames: Array<string>,
 *   filters?: {
 *     temporal?: { startDate: string, endDate: string },    // ISO date strings (YYYY-MM-DD)
 *     spatial?: { latMin: number, latMax: number, lonMin: number, lonMax: number, depthMin: number, depthMax: number }
 *   },
 *   collectionId?: number
 * }
 */
bulkDownloadAPI.downloadData = async (
  datasetShortNames,
  filters = null,
  collectionId = null,
) => {
  const endpoint = apiUrl + `/api/data/bulk-download`;

  const requestBody = { shortNames: datasetShortNames };

  if (filters) {
    requestBody.filters = transformFiltersForAPI(filters);
  }

  if (collectionId !== null && collectionId !== undefined) {
    const parsedId = parseInt(collectionId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new Error('collectionId must be a positive integer');
    }
    requestBody.collectionId = parsedId;
  }

  const response = await fetchWithAuth(endpoint, {
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

  // Trigger the download using shared service
  DownloadService.downloadBlob(blob, filename);
};

/**
 * Initialize bulk download feature by getting datasets metadata
 * @param {Array<string>} datasetShortNames - Array of dataset short names (may include invalid datasets)
 * @returns {Promise<Object>} Object containing datasets metadata
 * @note The backend filters out invalid/unavailable datasets from the response.
 * Only metadata for valid, available datasets will be returned, even if invalid
 * dataset short names are included in the request.
 */
bulkDownloadAPI.initBulkDownload = async (datasetShortNames) => {
  log.debug('initializing bulk download', { datasetShortNames });
  return await fetchMetadataFromLocalDb(datasetShortNames);
};

export default bulkDownloadAPI;
