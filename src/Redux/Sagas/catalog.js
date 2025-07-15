import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as dropboxActions from '../../features/datasetDownloadDropbox/state/actions';
import * as actionTypes from '../actionTypes/catalog';
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

function* fetchVaultLink(action) {
  const shortName = action.payload.shortName;

  yield put(catalogActions.setFetchVaultLinkRequestStatus(states.inProgress));
  let response;
  try {
    // Fetch initial page with default pagination
    response = yield call(api.dropbox.fetchDropboxVaultFiles, shortName, {
      page: 1,
      pageSize: 100,
    });
  } catch (e) {
    log.error('error fetching vault link', { shortName, error: e });
    yield put(catalogActions.setFetchVaultLinkRequestStatus(states.failed));
    return;
  }

  if (response && response.ok) {
    const jsonResponse = yield response.json();
    yield put(catalogActions.fetchVaultLinkSuccess(jsonResponse));
  } else {
    console.log('failed to get share link', response);
    yield put(catalogActions.setFetchVaultLinkRequestStatus(states.failed));
  }
}
export function* watchFetchVaultLink() {
  yield takeLatest(actionTypes.FETCH_VAULT_LINK, fetchVaultLink);
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
  // now get dropbox link
  yield put(dropboxActions.fetchVaultFilesPage(shortName, {}));

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
