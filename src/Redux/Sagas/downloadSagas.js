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

function* csvFromVizRequest_OLD(action) {
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

function* downloadRequest_OLD(action) {
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
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map((line) => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    yield put(interfaceActions.setLoadingMessage('Fetching metadata', tag));

    // Fetch metadata using the export service
    const metadata = yield call(DataExportService.fetchDatasetMetadata, {
      datasetShortName,
      fields: variableShortName,
    });
    // Filter metadata for the specific variable
    const filteredMetadata = {
      dataset: metadata.dataset,
      variables: metadata.variables.filter(
        (v) => v.var_short_name === variableShortName,
      ),
      variableStats: metadata.variableStats.filter(
        (v) => v.Variable === variableLongName,
      ),
    };
    if (
      !filteredMetadata.variables ||
      filteredMetadata.variables.length === 0
    ) {
      throw new Error('No metadata found for variable');
    }

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
  const { subsetParams, ancillaryData, tableName, shortName } = payload;

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
      shortName,
      ancillaryData,
    });

    // Use the export service to handle the download
    yield call(DataExportService.exportDataset, {
      query: {
        query,
        tableName,
        shortName,
        fields: query.fields || '*',
      },
    });

    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(catalogActions.datasetDownloadRequestSuccess());

    log.info('Successfully downloaded dataset', { tableName, shortName });
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
