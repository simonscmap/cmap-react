import {
  call,
  put,
  takeLatest,
  race,
  delay,
  select,
  all,
} from 'redux-saga/effects';
import api from '../../api/api';
import { makeDownloadQuery } from '../../Components/Catalog/DownloadDialog/downloadDialogHelpers';
import * as catalogActions from '../actions/catalog';
import * as catalogActionTypes from '../actionTypes/catalog';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import * as visualizationActionTypes from '../actionTypes/visualization';
import * as visualizationActions from '../actions/visualization';
import states from '../../enums/asyncRequestStates';
import logInit from '../../Services/log-service';
import DataExportService from '../../Services/dataDownload/dataExportService';

const log = logInit('sagas/downloadSagas').addContext({
  src: 'Redux/Sagas/downloadSagas',
});

export function* makeCheckQuerySizeRequest(query) {
  yield put(catalogActions.setCheckQueryRequestState(states.inProgress));

  const result = yield race({
    response: call(api.data.checkQuerySize, query),
    timeout: delay(60 * 1000),
  });
  return result;
}

export function* checkDownloadSize(action) {
  // set timeout of 1 minute
  // const { response, timeout} = yield race({
  //   response: call (api.data.checkQuerySize, action.payload.query),
  //   timeout: delay (60 * 1000)
  // });
  const { response, timeout } = yield makeCheckQuerySizeRequest(
    action.payload.query,
  );

  if (timeout) {
    yield put(
      interfaceActions.snackbarOpen(
        'Attempt to validate dowload size timed out.',
      ),
    );
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
  } else if (response && response.ok) {
    let jsonResponse = yield response.json();
    // pass back the exact query string as submitted; this will be used
    // to look up the response in the cache
    yield put(
      catalogActions.storeCheckQueryResult(action.payload.query, jsonResponse),
    );
    yield put(catalogActions.setCheckQueryRequestState(states.succeeded));
  } else if (response.status === 401) {
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
    yield put(userActions.refreshLogin());
  } else {
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
  }
}

function* csvDownloadRequest(action) {
  const tag = { tag: 'csvDownloadRequest' };
  yield put(visualizationActions.csvDownloadRequestProcessing());
  yield put(interfaceActions.setLoadingMessage('Fetching Data', tag));

  let dataResponse = yield call(
    api.visualization.csvDownload,
    action.payload.query,
  );

  yield put(interfaceActions.setLoadingMessage('', tag));

  if (dataResponse.failed) {
    // if unauthorized
    if (dataResponse.status === 401) {
      yield put(userActions.refreshLogin());
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'An error occurred. Please try again.',
          tag,
        ),
      );
    }
  } else {
    if (dataResponse.length > 1) {
      yield put(
        visualizationActions.downloadTextAsCsv(
          dataResponse,
          action.payload.fileName,
        ),
      );
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'No data found. Please expand query range.',
          tag,
        ),
      );
    }
  }
}

/**
 * Saga for handling visualization CSV/Excel download requests
 * Refactored to use the new unified DataExportService
 */
export function* csvFromVizRequest(action) {
  const tag = { tag: 'csvFromVizRequest' };
  const { payload } = action;
  const { vizObject, datasetShortName, variableShortName, variableLongName } =
    payload;

  yield put(interfaceActions.setLoadingMessage('Processing Data', tag));

  try {
    // Generate CSV data from visualization object
    const csvData = yield vizObject.generateCsv();

    // Parse CSV data to JSON for the export service
    const data = DataExportService.parseCSVToJSON(csvData);

    yield put(interfaceActions.setLoadingMessage('Fetching metadata', tag));

    // Fetch metadata using the export service
    const metadata = yield call(
      DataExportService.fetchDatasetMetadata,
      datasetShortName,
    );
    // Filter metadata for the specific variable
    const filteredMetadata = DataExportService.filterMetadataForVariable(
      metadata,
      variableShortName,
      variableLongName,
    );

    // Export data with metadata as Excel
    yield call(DataExportService.exportVisualizationData, {
      data,
      metadata: filteredMetadata,
      datasetName: datasetShortName,
      variableName: variableLongName,
      format: 'excel',
    });

    yield put(interfaceActions.setLoadingMessage('', tag));
    log.info('Successfully exported visualization data', {
      datasetShortName,
      variableShortName,
    });
  } catch (error) {
    log.error('Error in csvFromVizRequest', {
      error: error.message,
      stack: error.stack,
    });

    yield put(interfaceActions.setLoadingMessage('', tag));

    if (error.message === 'UNAUTHORIZED') {
      yield put(
        interfaceActions.snackbarOpen('Please log in to download data', tag),
      );
    } else if (error.message === 'No metadata found for variable') {
      yield put(
        interfaceActions.snackbarOpen(
          'Failed to retrieve variable metadata',
          tag,
        ),
      );
    } else {
      yield put(interfaceActions.snackbarOpen('Failed to download data', tag));
    }
  }
}

/**
 * Saga for handling dataset download requests
 * Refactored to use the new unified DataExportService
 */
export function* downloadRequest(action) {
  const tag = { tag: 'downloadRequest' };
  const { payload } = action;
  const {
    subsetParams,
    ancillaryData,
    tableName,
    shortName: datasetShortName,
  } = payload;

  // Check if user is logged in
  const user = yield select((state) => state.user);
  if (!user) {
    yield put(userActions.refreshLogin());
    return;
  }

  yield put(catalogActions.datasetDownloadRequestProcessing());
  yield put(interfaceActions.setLoadingMessage('Processing Request', tag));

  try {
    // Create query from subset parameters
    const query = makeDownloadQuery({ subsetParams, ancillaryData, tableName });

    yield put(interfaceActions.setLoadingMessage('Fetching Data', tag));

    log.info('[downloadRequest] Requesting dataset download', {
      tableName,
      datasetShortName,
      ancillaryData,
    });

    // Use the export service to handle the download
    yield call(DataExportService.exportDataset, {
      query: {
        query,
        tableName,
        datasetShortName,
        fields: query.fields || '*',
      },
    });

    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(catalogActions.datasetDownloadRequestSuccess());

    log.info('Successfully downloaded dataset', {
      tableName,
      datasetShortName,
    });
  } catch (error) {
    log.error('Error in downloadRequest', {
      error: error.message,
      stack: error.stack,
    });

    yield put(interfaceActions.setLoadingMessage('', tag));
    // yield put(catalogActions.datasetDownloadRequestFailure());

    if (error.message === 'UNAUTHORIZED') {
      yield put(userActions.refreshLogin());
    } else if (
      error.message === '400 TOO LARGE' ||
      error.message.includes('TOO LARGE')
    ) {
      yield put(
        interfaceActions.snackbarOpen(
          'Requested data exceeds size limits.',
          tag,
        ),
      );
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'There was an error requesting the dataset.',
          tag,
        ),
      );
    }
  }
}

// Watcher functions
export function* watchCheckDownloadSize() {
  yield takeLatest(catalogActionTypes.CHECK_QUERY_SIZE_SEND, checkDownloadSize);
}

export function* watchCsvFromVizRequest() {
  yield takeLatest(
    visualizationActionTypes.CSV_FROM_VIZ_REQUEST_SEND,
    csvFromVizRequest,
  );
}

export function* watchDownloadRequest() {
  yield takeLatest(
    catalogActionTypes.DATASET_DOWNLOAD_REQUEST_SEND,
    downloadRequest,
  );
}

export function* watchCsvDownloadRequest() {
  yield takeLatest(
    visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SEND,
    csvDownloadRequest,
  );
}

// Download saga that handles all download-related watchers
function* downloadSaga() {
  yield all([
    watchCheckDownloadSize(),
    watchCsvFromVizRequest(),
    watchDownloadRequest(),
    watchCsvDownloadRequest(),
  ]);
}

export default downloadSaga;
