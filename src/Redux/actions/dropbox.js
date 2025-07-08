import * as dropboxActionTypes from '../actionTypes/dropbox';

export const dropboxFilesDownloadRequest = (
  shortName,
  datasetId,
  selectedFiles,
) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_REQUEST,
  payload: {
    shortName,
    datasetId,
    selectedFiles,
  },
});

export const dropboxFilesDownloadSuccess = (downloadLink) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_SUCCESS,
  payload: {
    downloadLink,
  },
});

export const dropboxFilesDownloadFailure = (error) => ({
  type: dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_FAILURE,
  payload: {
    error,
  },
});
