// api requests specific to dropbox vault functionality
import { apiUrl, fetchOptions } from './config';
import logInit from '../Services/log-service';
const log = logInit('dropboxRequests');

const dropboxAPI = {};

dropboxAPI.fetchDropboxVaultFiles = async (
  shortName,
  paginationParams = {},
) => {
  const { page, chunkSize, cursor } = paginationParams;
  const params = new URLSearchParams();

  if (page) params.append('page', page);
  if (chunkSize) params.append('chunkSize', chunkSize);
  // if (pageSize) params.append('pageSize', pageSize);
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
