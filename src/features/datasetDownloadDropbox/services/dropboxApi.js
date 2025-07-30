// api requests specific to dropbox vault functionality
import { apiUrl, fetchOptions } from '../../../api/config';

const dropboxAPI = {};

/**
 * Fetch dropbox vault files with pagination and auto-download eligibility
 * @param {string} shortName - Dataset short name
 * @param {Object} paginationParams - Pagination parameters
 * @param {number} paginationParams.chunkSize - Number of files per chunk
 * @param {string} paginationParams.cursor - Cursor for pagination
 * @param {string} paginationParams.folderType - Type of folder ('rep', 'nrt', 'raw')
 * @returns {Promise<Response>} Response object with enhanced structure including:
 *   - autoDownloadEligible: boolean indicating if auto-download is available
 *   - directDownloadLink: string URL for direct download (if eligible)
 */
dropboxAPI.fetchDropboxVaultFiles = async (
  shortName,
  paginationParams = {},
) => {
  const { chunkSize, cursor, folderType } = paginationParams;
  const params = new URLSearchParams();

  if (chunkSize) params.append('chunkSize', chunkSize);
  if (cursor) params.append('cursor', cursor);
  if (folderType) params.append('folderType', folderType);

  const queryString = params.toString();
  const url = `${apiUrl}/api/data/dropbox-vault/get-files-info/${shortName}${
    queryString ? `?${queryString}` : ''
  }`;

  return await fetch(url);
};

dropboxAPI.downloadDropboxVaultFiles = async (
  shortName,
  datasetId,
  selectedFiles,
) => {
  const endpoint = `${apiUrl}/api/data/dropbox-vault/download-files`;
  const requestOptions = {
    ...fetchOptions,
    method: 'POST',
    headers: {
      ...fetchOptions.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shortName,
      datasetId,
      files: selectedFiles,
    }),
  };

  return await fetch(endpoint, requestOptions);
};

// Convenience methods for folder-specific requests
dropboxAPI.getMainFolderFiles = (shortName, options = {}) => {
  return dropboxAPI.fetchDropboxVaultFiles(shortName, options);
};

dropboxAPI.getRawFolderFiles = (shortName, options = {}) => {
  return dropboxAPI.fetchDropboxVaultFiles(shortName, { ...options, folderType: 'raw' });
};

export default dropboxAPI;
