import {
  call,
  put,
  takeLatest,
  race,
  delay,
  select,
  all,
} from 'redux-saga/effects';
import XLSX from 'xlsx';
import api from '../../api/api';
import {
  fetchDatasetAndMetadata,
  fetchDatasetMetadata,
  filterMetadataForVariable,
  makeMetadataWorkbook,
  makeZip,
} from '../../Components/Catalog/DownloadDialog/dataRequest';
import { makeDownloadQuery } from '../../Components/Catalog/DownloadDialog/downloadDialogHelpers';
import * as catalogActions from '../actions/catalog';
import * as catalogActionTypes from '../actionTypes/catalog';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import * as visualizationActionTypes from '../actionTypes/visualization';
import * as visualizationActions from '../actions/visualization';
import states from '../../enums/asyncRequestStates';
import logInit from '../../Services/log-service';

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

function* csvFromVizRequest(action) {
  const tag = { tag: 'csvFromVizRequest' };

  yield put(interfaceActions.setLoadingMessage('Processing Data', tag));
  const csvData = yield action.payload.vizObject.generateCsv();
  let dataWB = XLSX.read(csvData, { type: 'string' });
  let { payload } = action;
  let { datasetShortName, variableShortName, variableLongName } = payload;

  log.debug('csvFromVizRequest parameters', {
    datasetShortName,
    variableShortName,
    variableLongName,
  });

  yield put(interfaceActions.setLoadingMessage('Fetching metadata', tag));

  try {
    // Fetch the complete dataset metadata
    log.debug('Fetching dataset metadata', { datasetShortName });
    const metadataJSON = yield call(fetchDatasetMetadata, datasetShortName);

    // Filter metadata for the specific variable
    log.debug('Filtering metadata for variable', {
      variableShortName,
      variablesCount:
        metadataJSON && metadataJSON.variables
          ? metadataJSON.variables.length
          : 0,
    });
    const filteredMetadata = filterMetadataForVariable(
      metadataJSON,
      variableShortName,
    );
    if (!filteredMetadata) {
      log.error('No metadata found for variable', {
        datasetShortName,
        variableShortName,
      });
      yield put(interfaceActions.setLoadingMessage('', tag));
      yield put(
        interfaceActions.snackbarOpen(
          'Failed to retrieve variable metadata',
          tag,
        ),
      );
      return;
    }

    log.debug('Creating metadata workbook', {
      filteredVariablesCount: filteredMetadata.variables.length,
    });

    // Create a proper metadata workbook with all three sheets
    const metadataBlob = makeMetadataWorkbook(filteredMetadata);

    // Create a workbook with data and metadata
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataWB.Sheets.Sheet1, 'Data');

    // Read the metadata workbook and append its sheets
    const metadataWB = XLSX.read(metadataBlob, { type: 'array' });

    // Append each sheet from the metadata workbook
    Object.keys(metadataWB.Sheets).forEach((sheetName) => {
      log.debug('Appending metadata sheet', { sheetName });
      XLSX.utils.book_append_sheet(
        workbook,
        metadataWB.Sheets[sheetName],
        sheetName,
      );
    });

    // Write the workbook to a file
    log.debug('Writing workbook to file', {
      fileName: `${variableLongName}_${datasetShortName}.xlsx`,
    });
    XLSX.writeFile(workbook, `${variableLongName}_${datasetShortName}.xlsx`);
    yield put(interfaceActions.setLoadingMessage('', tag));
  } catch (e) {
    log.error('Error in csvFromVizRequest', {
      error: e.message,
      stack: e.stack,
    });
    console.error('Error in csvFromVizRequest:', e);
    yield put(interfaceActions.setLoadingMessage('', tag));

    if (e.message === 'UNAUTHORIZED') {
      yield put(
        interfaceActions.snackbarOpen('Please log in to download data', tag),
      );
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'Failed to download variable metadata',
          tag,
        ),
      );
    }
  }
}

function* downloadRequest(action) {
  const tag = { tag: 'downloadRequest' };
  // from DATASET_DOWNLOAD_REQUEST_SEND
  // payload should include (1) subsetParam, (2) tableName, (3) shortName
  // TODO extract query-making out of Component
  let user = yield select((state) => state.user);

  if (!user) {
    yield put(userActions.refreshLogin());
  }

  yield put(catalogActions.datasetDownloadRequestProcessing());
  yield put(interfaceActions.setLoadingMessage('Processing Request', tag));

  let { subsetParams, ancillaryData, tableName, shortName, fileName } =
    action.payload;

  let truncatedFileName = fileName.slice(0, 100);

  let query = makeDownloadQuery({ subsetParams, ancillaryData, tableName });
  yield put(interfaceActions.setLoadingMessage('Fetching Data', tag));

  try {
    log.info('requesting download', { ancillaryData, tableName, query });
    let data = yield call(fetchDatasetAndMetadata, { query, shortName });
    makeZip(data, truncatedFileName, shortName);
  } catch (e) {
    console.log(e.message);
    yield put(interfaceActions.setLoadingMessage('', tag));
    if (e.message === 'UNAUTHORIZED') {
      yield put(userActions.refreshLogin());
    } else if (e.message === '400 TOO LARGE') {
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
