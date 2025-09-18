import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as datasetDownloadActions from '../../features/datasetDownload/state';
import * as dropboxActions from '../../features/datasetDownloadDropbox/state/actions';
import * as actionTypes from '../actionTypes/catalog';
import * as datasetDownloadActionTypes from '../../features/datasetDownload/state/actionTypes';
import * as interfaceActionTypes from '../actionTypes/ui';
import * as interfaceActions from '../actions/ui';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';
import init from '../../Services/log-service';

const log = init('Sagas/Catalog');

// fetch list of dataset names
export function* fetchDatasetNames() {
  const tag = { tag: 'fetch dataset names' };
  // check state
  yield put(catalogActions.setDatasetNamesRequestStatus(states.inProgress));
  let response;
  try {
    response = yield call(api.catalog.datasetNames, null);
  } catch (e) {
    yield put(catalogActions.setDatasetNamesRequestStatus(states.failed));
    yield put(
      interfaceActions.snackbarOpen('Failed to retrieve dataset names', tag),
    );
    return;
  }
  if (response && response.ok) {
    const jsonResponse = yield response.json();
    yield put(catalogActions.fetchDatasetNamesSuccess(jsonResponse));
  } else {
    yield put(catalogActions.setDatasetNamesRequestStatus(states.failed));
    yield put(
      interfaceActions.snackbarOpen('Failed to retrieve dataset names', tag),
    );
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchDatasetNames() {
  yield takeLatest(actionTypes.FETCH_DATASET_NAMES, fetchDatasetNames);
}

// when dataset download dialog opens, handle fetching full page data,
// or retrieving it from cache
export function* getFullPageDataForDownload(action) {
  const shortName = action.payload.shortName;

  const detailPageData = yield select(
    (state) => state.datasetDetailPage && state.datasetDetailPage.dataset.data,
  );
  const dialogData = yield select((state) => state.downloadDialog.data);

  const detailPageShortName =
    detailPageData && detailPageData.dataset.Short_Name;
  // now get dropbox vault files directly
  try {
    const vaultResponse = yield call(
      api.dropbox.fetchDropboxVaultFiles,
      shortName,
      {},
    );
    if (vaultResponse && vaultResponse.ok) {
      const jsonResponse = yield vaultResponse.json();

      // Handle auto-download fields from API response
      const { autoDownloadEligible, directDownloadLink } = jsonResponse;
      if (typeof autoDownloadEligible === 'boolean') {
        yield put(
          dropboxActions.setAutoDownloadEligibility(
            autoDownloadEligible,
            directDownloadLink,
          ),
        );
      }

      yield put(dropboxActions.fetchVaultFilesPageSuccess(jsonResponse));
    } else {
      yield put(
        dropboxActions.fetchVaultFilesPageFailure('Failed to fetch files'),
      );
    }
  } catch (error) {
    log.error('error fetching vault files', { shortName, error });
    yield put(dropboxActions.fetchVaultFilesPageFailure(error.message));
  }

  if (!dialogData && detailPageShortName !== shortName) {
    log.info('fetching dataset metadata for download dialog', {
      dialogShortName: shortName,
      detailPageShortName,
    });
    yield put(
      interfaceActions.setFetchDownloadDialogDataRequestState(
        states.inProgress,
      ),
    );
    let response;
    try {
      response = yield call(api.catalog.datasetMetadata, shortName);
    } catch (e) {
      log.error('error fetching dataset metadata', { error: e });
      yield put(
        interfaceActions.setFetchDownloadDialogDataRequestState(states.failed),
      );
      yield put(
        interfaceActions.snackbarOpen('Failed to load dataset information'),
      );
      return;
    }

    if (response && response.ok) {
      const jsonResponse = yield response.json();
      yield put(
        interfaceActions.setFetchDownloadDialogDataRequestState(
          states.succeeded,
        ),
      );
      yield put(interfaceActions.setDownloadDialogData(jsonResponse.dataset));
      return;
    } else {
      yield put(
        interfaceActions.setFetchDownloadDialogDataRequestState(states.failed),
      );
      yield put(
        interfaceActions.snackbarOpen('Failed to load dataset information'),
      );
    }
  } else {
    // dialog component will get data from detail page data
  }
}

export function* watchDownloadDialogOpen() {
  yield takeLatest(
    interfaceActionTypes.DOWNLOAD_DIALOG_OPEN,
    getFullPageDataForDownload,
  );
}
