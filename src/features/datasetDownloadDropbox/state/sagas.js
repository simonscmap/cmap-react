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

  console.log('🚀 [PERF] Starting fetchVaultFilesPage API call', {
    shortName,
    folderType,
    timestamp: Date.now(),
  });
  const apiStartTime = performance.now();

  try {
    const response = yield call(
      api.dropbox.fetchDropboxVaultFiles,
      shortName,
      paginationParams,
    );

    const apiEndTime = performance.now();
    console.log('⚡ [PERF] API call completed', {
      shortName,
      folderType,
      apiDuration: `${(apiEndTime - apiStartTime).toFixed(2)}ms`,
      timestamp: Date.now(),
    });

    if (response && response.ok) {
      console.log('🔄 [PERF] Starting JSON parsing', {
        shortName,
        timestamp: Date.now(),
      });
      const jsonParseStart = performance.now();

      const jsonResponse = yield response.json();

      const jsonParseEnd = performance.now();
      console.log('📊 [PERF] JSON parsing completed', {
        shortName,
        fileCount: jsonResponse.files ? jsonResponse.files.length : 0,
        parseDuration: `${(jsonParseEnd - jsonParseStart).toFixed(2)}ms`,
        timestamp: Date.now(),
      });

      // Handle new auto-download fields from API response
      const { autoDownloadEligible, directDownloadLink } = jsonResponse;
      if (typeof autoDownloadEligible === 'boolean') {
        yield put(
          dropboxActions.setAutoDownloadEligibility(
            autoDownloadEligible,
            directDownloadLink,
          ),
        );
      }

      console.log(
        '📤 [PERF] Dispatching fetchVaultFilesPageSuccess to reducer',
        {
          shortName,
          fileCount: jsonResponse.files ? jsonResponse.files.length : 0,
          timestamp: Date.now(),
        },
      );
      const dispatchStart = performance.now();

      yield put(dropboxActions.fetchVaultFilesPageSuccess(jsonResponse));

      const dispatchEnd = performance.now();
      console.log('✅ [PERF] Reducer processing completed', {
        shortName,
        dispatchDuration: `${(dispatchEnd - dispatchStart).toFixed(2)}ms`,
        totalDuration: `${(dispatchEnd - apiStartTime).toFixed(2)}ms`,
        timestamp: Date.now(),
      });
    } else {
      yield put(
        dropboxActions.fetchVaultFilesPageFailure(
          'Failed to fetch files',
          folderType,
        ),
      );
    }
  } catch (error) {
    log.error('error fetching vault files page', {
      shortName,
      paginationParams,
      error,
    });
    yield put(
      dropboxActions.fetchVaultFilesPageFailure(error.message, folderType),
    );
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

// Saga to handle direct download trigger
function* handleDirectDownload(action) {
  const { downloadLink } = action.payload;

  try {
    yield log.info('Triggering direct download', { downloadLink });

    // Trigger the download by setting window.location.href
    if (typeof window !== 'undefined' && downloadLink) {
      window.location.href = downloadLink;
    }
  } catch (error) {
    yield log.error('Error triggering direct download', {
      downloadLink,
      error: error.message,
    });
  }
}

export function* watchDirectDownload() {
  yield takeLatest(
    dropboxActionTypes.TRIGGER_DIRECT_DOWNLOAD,
    handleDirectDownload,
  );
}

export function* watchDownloadDropboxFiles() {
  yield takeLatest(
    dropboxActionTypes.DOWNLOAD_DROPBOX_VAULT_FILES_REQUEST,
    downloadDropboxFiles,
  );
}
