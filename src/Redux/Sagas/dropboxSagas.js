import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import catalogAPI from '../../api/catalogRequests';
import * as dropboxActions from '../actions/dropbox';
import * as dropboxActionTypes from '../actionTypes/dropbox';
import * as interfaceActions from '../actions/ui';
import logInit from '../../Services/log-service';

const log = logInit('sagas/dropboxSagas').addContext({
  src: 'Redux/Sagas/dropboxSagas',
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
      catalogAPI.downloadDropboxVaultFiles,
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

  try {
    const response = yield call(
      catalogAPI.fetchVaultLink,
      shortName,
      paginationParams,
    );

    if (response && response.ok) {
      const jsonResponse = yield response.json();
      yield put(dropboxActions.fetchVaultFilesPageSuccess(jsonResponse));
    } else {
      yield put(
        dropboxActions.fetchVaultFilesPageFailure('Failed to fetch files'),
      );
    }
  } catch (error) {
    log.error('error fetching vault files page', {
      shortName,
      paginationParams,
      error,
    });
    yield put(dropboxActions.fetchVaultFilesPageFailure(error.message));
  }
}

export function* watchFetchVaultFilesPage() {
  yield takeEvery(dropboxActions.FETCH_VAULT_FILES_PAGE, fetchVaultFilesPage);
}

// Watcher saga
export function* watchDownloadDropboxFiles() {
  yield takeLatest(
    dropboxActionTypes.DROPBOX_FILES_DOWNLOAD_REQUEST,
    downloadDropboxFiles,
  );
}
