import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects';
import api from '../../../api/api';
import * as dropboxActions from './actions';
import * as dropboxActionTypes from './actionTypes';
import * as interfaceActions from '../../../Redux/actions/ui';
import logInit from '../../../Services/log-service';

const log = logInit('sagas/dropboxSagas').addContext({
  src: 'features/datasetDownloadDropbox/store/sagas',
});

export function* downloadDropboxFiles(action) {
  const tag = { tag: 'downloadDropboxFiles' };
  const { shortName, datasetId, selectedFiles } = action.payload;

  try {
    // Set loading state
    yield put(
      interfaceActions.setLoadingMessage('Preparing your download...', tag),
    );

    log.info('Starting dropbox files download', {
      shortName,
      datasetId,
      fileCount: selectedFiles.length,
    });

    // Make API call to download files
    const response = yield call(
      api.dropbox.downloadDropboxVaultFiles,
      shortName,
      datasetId,
      selectedFiles.map((file) => ({
        filePath: file.path,
        name: file.name,
      })),
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response to get the download link
    const responseData = yield response.json();
    if (!responseData.success || !responseData.downloadLink) {
      throw new Error(responseData.message || 'Download link not received');
    }
    // Dispatch success action with the download link
    yield put(
      dropboxActions.dropboxFilesDownloadSuccess(responseData.downloadLink),
    );

    log.info('Successfully prepared dropbox files download', {
      shortName,
      downloadLink: responseData.downloadLink,
    });
  } catch (error) {
    log.error('Error downloading dropbox files', {
      shortName,
      error: error.message,
      stack: error.stack,
    });

    // Dispatch failure action
    yield put(dropboxActions.dropboxFilesDownloadFailure(error.message));

    // Show error message
    yield put(
      interfaceActions.snackbarOpen(
        `Failed to download files: ${error.message}`,
        tag,
      ),
    );
  } finally {
    // Clear loading state
    yield put(interfaceActions.closeLoadingMessage(tag));
  }
}

// Pagination saga for vault files
function* fetchVaultFilesPage(action) {
  const { shortName, paginationParams } = action.payload;
  const folderType = paginationParams && paginationParams.folderType;

  try {
    const response = yield call(
      api.dropbox.fetchDropboxVaultFiles,
      shortName,
      paginationParams,
    );
    if (response && response.ok) {
      const jsonResponse = yield response.json();
      yield put(dropboxActions.fetchVaultFilesPageSuccess(jsonResponse));
    } else {
      yield put(
        dropboxActions.fetchVaultFilesPageFailure('Failed to fetch files', folderType),
      );
    }
  } catch (error) {
    log.error('error fetching vault files page', {
      shortName,
      paginationParams,
      error,
    });
    yield put(dropboxActions.fetchVaultFilesPageFailure(error.message, folderType));
  }
}

export function* watchFetchVaultFilesPage() {
  yield takeEvery(
    dropboxActionTypes.FETCH_DROPBOX_VAULT_FILES_PAGE,
    fetchVaultFilesPage,
  );
}

// Watcher saga
// Saga to handle folder tab changes
function* handleFolderTabChange(action) {
  const { folderType } = action.payload;
  
  // Get current state
  const state = yield select();
  const paginationByFolder = state.dropbox.paginationByFolder || {};
  const folderPagination = paginationByFolder[folderType];
  
  // If this folder hasn't been fetched yet, fetch it
  if (!folderPagination || !folderPagination.allCachedFiles.length) {
    // Get the dataset short name from the download dialog
    const shortName = state.downloadDialog.shortName;
    
    if (shortName) {
      yield put(dropboxActions.fetchVaultFilesPage(shortName, { folderType }));
    }
  }
}

export function* watchFolderTabChange() {
  yield takeEvery(
    dropboxActionTypes.SET_CURRENT_FOLDER_TAB,
    handleFolderTabChange,
  );
}

export function* watchDownloadDropboxFiles() {
  yield takeLatest(
    dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST,
    downloadDropboxFiles,
  );
}