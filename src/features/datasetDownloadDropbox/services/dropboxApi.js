// api requests specific to dropbox vault functionality
import { apiUrl, fetchOptions } from '../../../api/config';

const dropboxAPI = {};

dropboxAPI.fetchDropboxVaultFiles = async (
  shortName,
  paginationParams = {},
) => {
  const { chunkSize, cursor } = paginationParams;
  const params = new URLSearchParams();

  if (chunkSize) params.append('chunkSize', chunkSize);
  if (cursor) params.append('cursor', cursor);

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

export default dropboxAPI;
