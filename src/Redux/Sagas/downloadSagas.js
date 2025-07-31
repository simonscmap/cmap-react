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

/**
 * Saga for handling visualization data download requests
 * Uses the unified export method that exports data as ZIP with CSV data and Excel metadata
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

    yield put(interfaceActions.setLoadingMessage('Preparing download', tag));

    // Use unified export method - exports as ZIP with CSV data and Excel metadata
    yield call(DataExportService.exportDataWithMetadata, {
      data: csvData, // Pass CSV string directly
      metadata: filteredMetadata,
      datasetName: datasetShortName,
      variableName: variableLongName,
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
 * Uses the unified export method that exports data as ZIP with CSV data and Excel metadata
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

    // Fetch data and metadata in parallel
    const [dataResponse, metadata] = yield all([
      call(api.data.customQuery, query),
      call(DataExportService.fetchDatasetMetadata, datasetShortName),
    ]);

    // Handle data response errors
    if (!dataResponse.ok) {
      if (dataResponse.status === 401) {
        throw new Error('UNAUTHORIZED');
      } else if (dataResponse.status === 400) {
        const responseText = yield dataResponse.text();
        const errorMessage =
          responseText === 'query exceeds maximum size allowed'
            ? '400 TOO LARGE'
            : 'BAD REQUEST';
        throw new Error(errorMessage);
      } else {
        throw new Error('Failed to fetch data');
      }
    }

    // Get data as ArrayBuffer
    const dataArrayBuffer = yield dataResponse.arrayBuffer();

    yield put(interfaceActions.setLoadingMessage('Preparing download', tag));

    // Use DataExportService to handle all buffer processing and size decisions
    yield call(DataExportService.exportDataWithMetadata, {
      data: dataArrayBuffer, // Pass ArrayBuffer directly
      metadata,
      datasetName: tableName,
    });

    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(catalogActions.datasetDownloadRequestSuccess());

    log.info('Successfully downloaded dataset', {
      tableName,
      datasetShortName,
    });
  } catch (error) {
    yield put(interfaceActions.setLoadingMessage('', tag));

    // Set user message for download failures
    const userMessage = 'Failed to download dataset';

    // yield put(catalogActions.datasetDownloadRequestFailure(userMessage));

    log.error('Error in downloadRequest', {
      error: error.message,
      stack: error.stack,
      tableName,
      datasetShortName,
    });

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
          userMessage,
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

// Download saga that handles all download-related watchers
function* downloadSaga() {
  yield all([
    watchCheckDownloadSize(),
    watchCsvFromVizRequest(),
    watchDownloadRequest(),
  ]);
}

export default downloadSaga;
