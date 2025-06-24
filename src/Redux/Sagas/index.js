import Cookies from 'js-cookie';
import queryString from 'query-string';
import {
  all,
  call,
  debounce,
  delay,
  put,
  select,
  takeLatest,
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
import { lastRowTimeSpaceDataFromChart } from '../../Components/Visualization/helpers';
import states from '../../enums/asyncRequestStates';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../enums/sparseDataQueryMaxSize';
import buildSearchOptionsFromDatasetList from '../../Utility/Catalog/buildSearchOptionsFromDatasetList';
import buildSearchOptionsFromVariablesList from '../../Utility/Catalog/buildSearchOptionsFromVariablesList';
import groupDatasetsByMake from '../../Utility/Catalog/groupDatasetsByMake';
import groupVariablesByDataset from '../../Utility/Catalog/groupVariablesByDataset';
import ammendSearchResults from '../../Utility/Catalog/ammendSearchResultsWithDatasetFeatures';
// import parseError from '../../Utility/parseError';

// Action Creators
import * as catalogActions from '../actions/catalog';
import * as dataSubmissionActions from '../actions/dataSubmission';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import * as visualizationActions from '../actions/visualization';
import * as catalogActionTypes from '../actionTypes/catalog';
import * as communityActionTypes from '../actionTypes/community';
// import * as communityActions from '../actions/community';
import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import * as interfaceActionTypes from '../actionTypes/ui';
import * as userActionTypes from '../actionTypes/user';
import * as visualizationActionTypes from '../actionTypes/visualization';

// watchers
// NOTE: the functions the watchers call do not need to be imported here
// they are simply referenced in the watcher functions
import {
  watchUserLogin,
  watchUserRegistration,
  watchUserValidation,
  watchUserLogout,
  watchGoogleLoginRequest,
  watchGoogleLoginRequestFailure,
  watchKeyRetrieval,
  watchKeyCreationRequest,
  watchContactUs,
  watchNominateNewData,
  watchFetchLastUserTouch,
  watchFetchUserSubscriptions,
  watchCreateSubscription,
  watchDeleteSubscriptions,
} from './userSagas';

import {
  watchFetchDatasetNames,
  watchDownloadDialogOpen,
  watchFetchVaultLink,
} from './catalog';

import {
  watchRequestNewsList,
  watchUpdateNewsItem,
  watchUpdateNewsItemSuccess,
  watchPublishNewsItem,
  watchPublishNewsItemSuccess,
  watchPreviewNewsItem,
  watchPreviewNewsItemSuccess,
  watchDraftNewsItem,
  watchDraftNewsItemSuccess,
  watchUnpublishNewsItem,
  watchUnpublishNewsItemSuccess,
  watchCreateNewsItem,
  watchCreateNewsItemSuccess,
  watchUpdateNewsRanks,
  watchUpdateNewsRanksSuccess,
  watchFeatureNewsItem,
  watchFeatureNewsItemSuccess,
  watchCategorizeNewsItem,
  watchCategorizeNewsItemSuccess,
} from './news';

import {
  watchFetchNotificationHistory,
  watchFetchNotificationProjection,
  watchFetchNotificationPreviews,
  watchSendNotifications,
  watchReSendNotifications,
} from './notifications';

import { watchCheckDownloadSize } from './downloadSagas';

import { watchRequestHighlightsSend } from './highlights';

import {
  watchRequestTrajectoryPointCounts,
  watchCheckVizQuerySize,
} from './visualizationSagas';

import {
  // watchRequestSSTAnomalyDataSend,
  // watchRequestADTAnomalyDataSend,
  watchRequestAvgSSTAnomalyDataSend,
  watchRequestAvgADTAnomalyDataSend,
} from './anomaly';

import {
  watchCheckSubmissionNameRequestSend,
  uploadFileParts,
} from './dataSubmission';

import {
  watchVisualizableVariablesFetch,
  watchDatasetVariableVisDataFetch,
} from './datasetDetailSagas';

import {
  watchFetchProgramsSend,
  watchFetchProgramDetailsSend,
  watchProgramSampleVisDataFetch,
} from './programsSagas';

import { localStorageApi } from '../../Services/persist/local';
import logInit from '../../Services/log-service';
const log = logInit('sagas').addContext({ src: 'Redux/Sagas' });

function* updateLoadingMessage() {
  // if "Loading Data" is still showing 15 seconds after making a request
  // update the message
  yield delay(1000 * 15); // 15 seconds
  let loadingMessage = yield select((state) => state.loadingMessage);
  if (loadingMessage === 'Fetching Data') {
    const msg =
      'Fetching Data... Large queries may take a long time to complete.';
    const meta = { tag: 'updateLoadingMessage' };
    yield put(interfaceActions.setLoadingMessage(msg, meta));
  }
}

function* queryRequest(action) {
  yield put(visualizationActions.queryRequestProcessing());
  let result = yield call(api.visualization.queryRequest, action.payload.query);
  yield put(visualizationActions.storeSampleData(result));
  yield put(visualizationActions.queryRequestSuccess());
}

// fetch data for visualization
function* storedProcedureRequest(action) {
  yield put(visualizationActions.storedProcedureRequestProcessing());
  const msg = 'Fetching Data';
  const meta = { tag: 'storedProcedureRequest' };
  yield put(interfaceActions.setLoadingMessage(msg, meta));

  let result;
  try {
    result = yield call(
      api.visualization.storedProcedureRequest,
      action.payload,
    );
  } catch (e) {
    yield put(interfaceActions.setLoadingMessage('', meta));
    yield put(interfaceActions.snackbarOpen('Error processing data'));
    return;
  }

  yield delay(50);
  yield put(interfaceActions.setLoadingMessage('Processing Data', meta));
  yield delay(70);

  // Result will be an object containing variable values and describing date shape
  if (result.failed) {
    yield put(interfaceActions.setLoadingMessage('', meta));
    yield put(visualizationActions.storedProcedureRequestFailure());
    if (result.status === 401) {
      yield put(userActions.refreshLogin());
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'An unexpected error occurred. Please reduce the size of your query and try again.',
        ),
      );
    }
  } else {
    if (result.variableValues.length > 0) {
      result.finalize();
      yield put(visualizationActions.handleGuestVisualization());
      yield put(interfaceActions.setLoadingMessage('', meta));
      yield put(visualizationActions.storedProcedureRequestSuccess());
      yield put(visualizationActions.triggerShowCharts());
      yield put(
        visualizationActions.addChart({
          subType: action.payload.subType,
          data: result,
        }),
      );
      window.scrollTo(0, 0);
    } else {
      yield put(interfaceActions.setLoadingMessage('', meta));
      yield put(
        interfaceActions.snackbarOpen(
          `No data found for ${action.payload.parameters.fields} in the requested ranges. Try selecting a different date or depth range.`,
        ),
      );
    }
  }
}

function* cruiseTrajectoryRequest(action) {
  const tag = { tag: 'cruiseTrajectoryRequest' };
  yield put(visualizationActions.cruiseTrajectoryRequestProcessing());
  yield put(interfaceActions.setLoadingMessage('Fetching Cruise Data', tag));
  let result = yield call(
    api.visualization.cruiseTrajectoryRequest,
    action.payload,
  );
  yield put(interfaceActions.setLoadingMessage('', tag));

  if (result.failed) {
    if (result.status === 401) {
      yield put(userActions.refreshLogin());
    } else {
      yield put(
        interfaceActions.snackbarOpen(`Unable to Fetch Cruise Data`, tag),
      );
    }
  } else {
    yield put(visualizationActions.cruiseTrajectoryRequestSuccess(result));
    yield put(interfaceActions.setLoadingMessage('', tag));
  }
}

function* cruiseListRequest() {
  yield put(visualizationActions.cruiseListRequestProcessing());
  let cruiseList = yield call(api.visualization.cruiseList);

  if (!cruiseList) {
    yield put(visualizationActions.cruiseListRequestFailure());
  } else {
    cruiseList.forEach(
      (cruise) =>
        (cruise.Regions = cruise.Regions ? cruise.Regions.split(',') : []),
    );
    yield put(visualizationActions.cruiseListRequestSuccess(cruiseList));
  }
}

function* tableStatsRequest(action) {
  const tag = { tag: 'tableStatsRequest' };
  yield put(visualizationActions.tableStatsRequestProcessing());
  yield put(
    interfaceActions.setLoadingMessage('Fetching Dataset Information', tag),
  );
  let result = yield call(
    api.visualization.getTableStats,
    action.payload.tableName,
  );
  yield put(interfaceActions.setLoadingMessage('', tag));

  if (result.failed) {
    if (result.status === 401) {
      yield put(userActions.refreshLogin());
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          `Unable to Fetch Dataset Information`,
          tag,
        ),
      );
    }
  } else {
    yield put(
      visualizationActions.tableStatsRequestSuccess(
        result,
        action.payload.datasetLongName,
      ),
    );
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
  let { tableName, shortName: variableName } = payload;

  // Remove 'tbl' prefix from tableName to get the actual shortName
  const shortName = tableName.startsWith('tbl')
    ? tableName.substring(3)
    : tableName;

  log.debug('csvFromVizRequest parameters', {
    originalTableName: tableName,
    shortName,
    variableName,
  });

  yield put(interfaceActions.setLoadingMessage('Fetching metadata', tag));

  try {
    // Fetch the complete dataset metadata
    log.debug('Fetching dataset metadata', { shortName });
    const metadataJSON = yield call(fetchDatasetMetadata, shortName);

    // Filter metadata for the specific variable
    log.debug('Filtering metadata for variable', {
      variableName,
      variablesCount:
        metadataJSON && metadataJSON.variables
          ? metadataJSON.variables.length
          : 0,
    });
    const filteredMetadata = filterMetadataForVariable(
      metadataJSON,
      variableName,
    );

    if (!filteredMetadata) {
      log.error('No metadata found for variable', { shortName, variableName });
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
      fileName: action.payload.longName,
    });
    XLSX.writeFile(workbook, `${action.payload.longName}.xlsx`);
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

function* refreshLogin() {
  yield call(api.user.logout);
  yield put(userActions.destroyInfo());
  yield put(interfaceActions.showLoginDialog());
  // yield put(interfaceActions.snackbarOpen("Your session has expired. Please log in again."));
}

function* updateUserInfoRequest(action) {
  const tag = { tag: 'updateUserInfoRequest' };
  yield put(
    interfaceActions.setLoadingMessage('Updating your information', tag),
  );

  let response = yield call(api.user.updateUserInfo, action.payload);

  if (response.ok) {
    const msg =
      action.payload.successMessage || 'Your information was updated.';
    yield put(userActions.storeInfo(JSON.parse(Cookies.get('UserInfo'))));
    yield put(interfaceActions.snackbarOpen(msg, tag));
  } else if (response.status === 401) {
    yield put(interfaceActions.setLoadingMessage('', tag));
    const snack401Message =
      'The request to update your profile failed to authorize, please login again.';
    yield put(interfaceActions.snackbarOpen(snack401Message, tag));
    yield put(userActions.refreshLogin());
  } else {
    yield put(interfaceActions.setLoadingMessage('', tag));
    const errorMessage = 'An error occurred. Please try again.';
    yield put(interfaceActions.snackbarOpen(errorMessage, tag));
  }

  yield put(interfaceActions.setLoadingMessage('', tag));
}

function* recoverPasswordRequest(action) {
  yield call(api.user.recoverPassword, action.payload.email);
}

function* choosePasswordRequest(action) {
  yield put(interfaceActions.setLoadingMessage('Confirming change'));
  let result = yield call(api.user.choosePassword, action.payload);
  yield put(interfaceActions.setLoadingMessage(''));
  if (result.ok) {
    yield put(userActions.choosePasswordRequestSuccess());
  } else {
    yield put(userActions.choosePasswordRequestFailure());
  }
}

function* changePasswordRequest(action) {
  const tag = { tag: 'changePasswordRequest' };
  yield put(interfaceActions.setLoadingMessage('Confirming Changes', tag));
  let result = yield call(api.user.changePassword, action.payload);
  yield put(interfaceActions.setLoadingMessage('', tag));

  if (result.ok) {
    yield put(interfaceActions.hideChangePasswordDialog());
    yield put(
      interfaceActions.snackbarOpen('Your password has been updated.', tag),
    );
  } else if (result.status === 401) {
    yield put(
      interfaceActions.snackbarOpen(
        'The current password you entered is not correct.',
        tag,
      ),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'An error occurred with your request.',
        tag,
      ),
    );
  }
}

function* changeEmailRequest(action) {
  const tag = { tag: 'changeEmailRequest' };
  yield put(interfaceActions.setLoadingMessage('Confirming Changes', tag));
  let result = yield call(api.user.changeEmail, action.payload);

  if (result.ok) {
    yield put(userActions.storeInfo(JSON.parse(Cookies.get('UserInfo'))));
    yield put(interfaceActions.hideChangeEmailDialog());
    yield put(
      interfaceActions.snackbarOpen(
        'Your email address has been updated.',
        tag,
      ),
    );
  } else if (result.status === 401) {
    yield put(
      interfaceActions.snackbarOpen(
        'The current password you entered is not correct.',
        tag,
      ),
    );
  } else if (result.status === 409) {
    yield put(
      interfaceActions.snackbarOpen(
        'That email address is already in use.',
        tag,
      ),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'We were not able to update your email address.',
        tag,
      ),
    );
  }

  yield put(interfaceActions.setLoadingMessage('', tag));
}

function* copyTextToClipboard(action) {
  var textArea = document.createElement('textarea');
  textArea.value = action.payload.text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('Copy');
  textArea.remove();
  yield put(interfaceActions.snackbarOpen('Copied to Clipboard'));
}

function* retrieveSubmissionsByUser() {
  const msg = 'Fetching submission information';
  yield put(
    interfaceActions.setLoadingMessage(msg, {
      tag: 'retrieveSubmissionsByUser',
    }),
  );
  let response = yield call(api.dataSubmission.retrieveSubmissionByUser);
  if (response.ok) {
    let jsonResponse = yield response.json();
    yield put(dataSubmissionActions.storeSubmissions(jsonResponse));
  } else if (response.status === 401) {
    yield put(userActions.refreshLogin());
  } else {
    yield put(interfaceActions.snackbarOpen('Unable to retrieve submissions'));
  }
  let currentMessage = yield select((state) => state.loadingMessage);
  // don't clear other messages that may have been displayed in the meantime
  if (currentMessage === msg) {
    // current message can be cleared
    yield put(
      interfaceActions.setLoadingMessage('', {
        tag: 'retrieveSubmissionsByUser',
      }),
    );
  }
}

function* retrieveAllSubmissions() {
  const tag = { tag: 'retrieveAllSubmissions' };
  let response = yield call(api.dataSubmission.retrieveAllSubmissions);
  if (response.ok) {
    let jsonResponse = yield response.json();

    if (jsonResponse.length < 1) {
      yield put(interfaceActions.snackbarOpen('No submissions found', tag));
    } else {
      yield put(dataSubmissionActions.storeSubmissions(jsonResponse));
    }
  } else if (response.status === 401) {
    yield put(userActions.refreshLogin());
  } else {
    yield put(
      interfaceActions.snackbarOpen('Unable to retrieve submissions', tag),
    );
  }
}

function* addSubmissionComment(action) {
  let response = yield call(
    api.dataSubmission.addSubmissionComment,
    action.payload,
  );

  if (response.ok) {
    yield put(
      dataSubmissionActions.retrieveSubmissionCommentHistory(
        action.payload.submissionID,
      ),
    );
    if (action.payload.source === 'admin') {
      yield put(dataSubmissionActions.retrieveAllSubmissions());
    } else {
      yield put(dataSubmissionActions.retrieveDataSubmissionsByUser());
    }
  } else if (response.status === 401) {
    yield put(userActions.refreshLogin());
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to submit comment. Please try again.',
      ),
    );
  }
}

function* retrieveSubmissionCommentHistory(action) {
  yield put(
    dataSubmissionActions.setSubmissionCommentHistoryRetrievalState(
      states.inProgress,
    ),
  );

  let response = yield call(
    api.dataSubmission.retrieveCommentHistory,
    action.payload,
  );

  if (response.ok) {
    let jsonResponse = yield response.json();

    if (jsonResponse.length >= 1) {
      let payload = {
        comments: jsonResponse,
        submissionID: action.payload.submissionID,
      };
      yield put(dataSubmissionActions.storeSubmissionComments(payload));
    }
  } else if (response.status === 401) {
    yield put(userActions.refreshLogin());
  } else {
    yield put(
      interfaceActions.snackbarOpen('Failed to retrieve comment history.'),
    );
  }

  yield put(
    dataSubmissionActions.setSubmissionCommentHistoryRetrievalState(
      states.succeeded,
    ),
  );
}

function* uploadSubmission(action) {
  const tag = { tag: 'uploadSubmission' };
  yield put(dataSubmissionActions.setUploadState(states.inProgress));

  let {
    submissionType,
    submissionId,
    file,
    rawFile,
    datasetName,
    datasetLongName,
    dataSource,
  } = action.payload;

  // check
  if (!file) {
    log.error('no file provided to uploadSubmission saga', {
      ...action.payload,
    });
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(
      interfaceActions.snackbarOpen(
        'There was an error beginning file upload.',
        tag,
      ),
    );
    return;
  }

  if (submissionType === 'new' && !rawFile) {
    log.error('no raw file provided to uploadSubmission saga', {
      ...action.payload,
    });
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(
      interfaceActions.snackbarOpen(
        'There was an error beginning file upload.',
        tag,
      ),
    );
    return;
  }

  // check audit
  const auditReport = yield select((state) => state.auditReport);

  const totalErrors =
    auditReport && auditReport.errorCount && auditReport.errorCount.sum;
  if (totalErrors !== 0) {
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(
      interfaceActions.snackbarOpen(
        'There are validation errors preventing submission',
        tag,
      ),
    );
    return;
  }

  // check name again
  let response;
  const checkNamePayload = {
    shortName: datasetName,
    longName: datasetLongName,
    submissionId,
  };
  try {
    response = yield call(api.dataSubmission.checkName, checkNamePayload);
  } catch (e) {
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(
      dataSubmissionActions.setCheckSubmNameRequestStatus(states.failed),
    );
    return;
  }
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(dataSubmissionActions.checkSubmNameResponseStore(jsonResponse));
    // TODO check
    const {
      shortNameIsAlreadyInUse,
      shortNameUpdateConflict,
      longNameIsAlreadyInUse,
      longNameUpdateConflict,
    } = jsonResponse;

    const conflict =
      shortNameIsAlreadyInUse ||
      shortNameUpdateConflict ||
      longNameIsAlreadyInUse ||
      longNameUpdateConflict;

    if (conflict) {
      yield put(interfaceActions.snackbarOpen('Name check failed', tag));
      yield put(dataSubmissionActions.setUploadState(states.failed));
      return;
    }
  } else {
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(
      dataSubmissionActions.setCheckSubmNameRequestStatus(states.failed),
    );
    return;
  }

  // let chunkSize = 5 * 1024 * 1024;
  // let offset = 0;

  // 1. start an upload session (get sessionId)
  let beginSessionFormData = new FormData();

  beginSessionFormData.append('submissionType', submissionType);
  beginSessionFormData.append('submissionId', submissionId);

  const contains1SessionId = (arr) => arr && arr.length === 1;
  const contains2SessionIds = (arr) => arr && arr.length === 2;

  let getSessionRetries = 0;
  let sessionIds = [];

  while (getSessionRetries < 3 && sessionIds.length === 0) {
    let beginSessionResponse = yield call(
      api.dataSubmission.beginUploadSession,
      beginSessionFormData,
    );

    if (beginSessionResponse.ok) {
      let jsonResp = yield beginSessionResponse.json();
      let idsArray = jsonResp.sessionIds;

      // if sessionIds are not set in this block, the generator will exit and display an error to the user
      if (!Array.isArray(idsArray)) {
        log.error(
          'error retrieving session ids for upload: expected sessionIds array',
          { idsArray },
        );
      } else if (submissionType === 'new') {
        if (contains2SessionIds(idsArray)) {
          sessionIds = idsArray.slice();
        } else {
          log.error('expected 2 session ids for new submission', { idsArray });
        }
      } else if (submissionType === 'update') {
        if (contains1SessionId(idsArray)) {
          sessionIds = idsArray.slice();
        } else {
          log.error('expected 1 session ids for new submission', { idsArray });
        }
      } else {
        log.error('error retrieving session ids unexpected result', {
          jsonResp,
        });
      }
    } else {
      let message = yield beginSessionResponse.text();
      if (message === 'wrongUser') {
        yield put(dataSubmissionActions.setUploadState(states.failed));
        return;
      } else if (message === 'noRecord') {
        yield put(dataSubmissionActions.setUploadState(states.failed));
        yield put(interfaceActions.snackbarOpen('No submission found', tag));
        log.error('no submission found', { submissionId });
      } else {
        getSessionRetries++;
        yield delay(2000);
      }
    }
  }

  if (!sessionIds.length) {
    yield put(
      interfaceActions.snackbarOpen('Failed to begin upload session', tag),
    );
    return;
  }

  // 2: attempt upload with sessionId

  // 2 (a) upload file chunks
  const [uploadError] = yield uploadFileParts({
    uploadSessionId: sessionIds[0],
    file,
  });

  // 2 (b) upload raw file as well
  let rawFileUploadError;
  if (submissionType === 'new' && rawFile) {
    [rawFileUploadError] = yield uploadFileParts({
      uploadSessionId: sessionIds[1],
      file: rawFile,
    });
  }

  if (uploadError || rawFileUploadError) {
    yield put(interfaceActions.snackbarOpen('Upload failed', tag));
    yield put(dataSubmissionActions.setUploadState(states.failed));
    return;
  }

  // 2 (c) commit upload with rest of data
  // reset retries counter, now to be used for commit call

  let fileSize = file.size;
  let rawFileSize = rawFile ? rawFile.size : 0;

  console.log(`expected offsets. file: ${fileSize}, raw: ${rawFileSize}`);

  let formData = new FormData();
  formData.append('shortName', datasetName);
  formData.append('offsets', fileSize);
  if (submissionType === 'new') {
    formData.append('offsets', rawFileSize);
  }
  sessionIds.forEach((sid) => {
    formData.append('sessionIds', sid);
  });
  formData.append('dataSource', dataSource);
  formData.append('datasetLongName', datasetLongName);
  formData.append('submissionType', submissionType);
  formData.append('submissionId', submissionId);

  let commitSucceeded = false;

  let commitFileResponse;
  let commitRetries = 0;
  while (commitRetries < 4 && commitSucceeded === false) {
    commitFileResponse = yield call(api.dataSubmission.commitUpload, formData);
    if (commitFileResponse.ok) {
      commitSucceeded = true;
    } else {
      commitRetries++;
      yield delay(9000);
    }
  }

  if (commitSucceeded === true) {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(
      dataSubmissionActions.setUploadState(states.succeeded, datasetName),
    );
  } else {
    const respStatus = commitFileResponse && commitFileResponse.status;
    log.error(`API responded to commit request with ${respStatus}`, {
      ...commitFileResponse,
    });
    yield put(dataSubmissionActions.setUploadState(states.failed));
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(interfaceActions.snackbarOpen('Failed to upload', tag));
    return;
  }
}

function* setDataSubmissionPhase(action) {
  const tag = { tag: 'setDataSubmissionPhase' };
  let formData = {
    phaseID: action.payload.phaseID,
    submissionID: action.payload.submissionID,
  };

  let response = yield call(api.dataSubmission.setPhase, formData);

  if (response.ok) {
    yield put(dataSubmissionActions.retrieveAllSubmissions());
  } else if (response.status === 401) {
    yield put(userActions.refreshLogin());
  } else {
    yield put(
      interfaceActions.snackbarOpen('Failed to retrieve submissions', tag),
    );
  }
}

function* retrieveMostRecentFile(action) {
  const tag = { tag: 'retrieveMostRecentFile' };
  const { submissionID } = action.payload;

  yield put(
    interfaceActions.setLoadingMessage('Fetching the latest submission', tag),
  );

  let linkResponse = yield call(
    api.dataSubmission.retrieveMostRecentFile,
    submissionID,
  );

  if (linkResponse.ok) {
    let jsonResponse = yield linkResponse.json();

    let { link, dataset, submissionId } = jsonResponse;

    let getFileResponse = yield call(api.dataSubmission.getFileFromLink, link);
    let blob = yield getFileResponse.blob();
    blob.name = `${dataset}.xlsx`;

    yield put(
      dataSubmissionActions.checkSubmissionOptionsAndStoreFile(
        blob,
        submissionId,
      ),
    );
  } else if (linkResponse.status === 401) {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(userActions.refreshLogin());
  } else {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(
      interfaceActions.snackbarOpen('Failed to retrieve submissions', tag),
    );
  }
}

function* fetchSubmissionOptions() {
  let storedOptions = yield select(
    (state) => state.dataSubmissionSelectOptions,
  );
  let options;

  if (storedOptions) {
    options = storedOptions;
  } else {
    let result = yield call(api.catalog.submissionOptions);
    if (!result.ok) {
      // don't alert here
    } else {
      options = yield result.json();
      let tempRemoveInSituOptions = {
        ...options,
        Sensor: options.Sensor.filter((item) => item !== 'In-Situ'),
      };
      yield put(
        dataSubmissionActions.dataSubmissionSelectOptionsStore(
          tempRemoveInSituOptions,
        ),
      );
    }
  }
}

function* checkSubmissionOptionsAndStoreFile(action) {
  const tag = { tag: 'checkSubmissionOptionsAndStoreFile' };
  let storedOptions = yield select(
    (state) => state.dataSubmissionSelectOptions,
  );
  let options;

  if (storedOptions) {
    options = storedOptions;
  } else {
    let result = yield call(api.catalog.submissionOptions);
    if (!result.ok) {
      return put(
        interfaceActions.snackbarOpen(
          'Unable to retrieve validation options',
          tag,
        ),
      );
    } else {
      options = yield result.json();
      let tempRemoveInSituOptions = {
        ...options,
        Sensor: options.Sensor.filter((item) => item !== 'In-Situ'),
      };
      yield put(
        dataSubmissionActions.dataSubmissionSelectOptionsStore(
          tempRemoveInSituOptions,
        ),
      );
    }
  }

  yield put(
    dataSubmissionActions.storeSubmissionFile(
      action.payload.file,
      action.payload.submissionId,
    ),
  );
}

function* downloadMostRecentFile(action) {
  const tag = { tag: 'downloadMostRecentFile' };

  const { submissionID } = action.payload;

  yield put(
    interfaceActions.setLoadingMessage(
      'Downloading the latest submission',
      tag,
    ),
  );

  let linkResponse = yield call(
    api.dataSubmission.retrieveMostRecentFile,
    submissionID,
  );

  if (linkResponse.ok) {
    let jsonResponse = yield linkResponse.json();

    let { link, dataset } = jsonResponse;

    let getFileResponse = yield call(api.dataSubmission.getFileFromLink, link);
    let blob = yield getFileResponse.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${dataset}.xlsx`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // URL.revokeObjectURL(url); // TODO test this
    yield put(interfaceActions.setLoadingMessage('', tag));
  } else if (linkResponse.status === 401) {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(userActions.refreshLogin());
  } else {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(interfaceActions.snackbarOpen('Unable to download', tag));
  }
}

function* keywordsFetch() {
  let keywordsFetchResponse = yield call(api.catalog.fetchKeywords);

  if (keywordsFetchResponse.ok) {
    let jsonResponse = yield keywordsFetchResponse.json();
    yield put(catalogActions.keywordsStore(jsonResponse));
  }
}

function* searchOptionsFetch() {
  let result = yield call(api.catalog.submissionOptions);
  if (result.ok) {
    let options = yield result.json();
    options.Temporal_Resolution.unshift('Any');
    options.Spatial_Resolution.unshift('Any');
    options.Data_Source.unshift('Any');
    options.Distributor.unshift('Any');
    options.Process_Level.unshift('Any');
    yield put(catalogActions.storeSubmissionOptions(options));
  } else {
    console.log('Failed to retrieve search options');
  }
}

/************** Catalog Page **********************/

// This saga is debounced in its watch function
function* searchResultsFetch(action) {
  const tag = { tag: 'searchResultsFetch' };

  let result = yield call(
    api.catalog.searchResults,
    action.payload.queryString,
  );

  if (result.ok) {
    const storedOptions = yield select((state) => state.submissionOptions);
    const params = queryString.parse(action.payload.queryString);
    const datasetFeatures = yield select(
      (state) => state.catalog.datasetFeatures,
    );

    let results = yield result.json();

    // if the dataset features data has already loaded, ammend the results
    // otherwise this will be performed when the data loaded;
    // see fetchDatasetFeatures and updateCatalogWithDatasetFeatures
    if (datasetFeatures) {
      results = ammendSearchResults(results, datasetFeatures);
    }

    let options = buildSearchOptionsFromDatasetList(
      results,
      storedOptions,
      params,
    );

    yield put(catalogActions.searchResultsStore(results, options));
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve search results. Please try again later.',
        tag,
      ),
    );
  }
  yield put(catalogActions.searchResultsSetLoadingState(states.succeeded));
}

/* fetch data for recommendations */

function* fetchPopularDatasets() {
  const tag = { tag: 'fetchPopularDatasets' };
  let response = yield call(api.catalog.fetchPopularDatasets);
  if (response && Array.isArray(response)) {
    yield put(catalogActions.popularRecsRequestSuccess(response));
  } else {
    yield put(catalogActions.popularRecsRequestFailure(response));
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve popular datasets.',
        tag,
      ),
    );
  }
}

function* fetchRecentDatasets(action) {
  const tag = { tag: 'fetchRecentDatasets' };

  // check cache
  const localValue = localStorageApi.get('recentRecs');

  let parsedLocalValue;
  try {
    parsedLocalValue = JSON.parse(localValue);
  } catch (e) {
    console.log('error parsing string from local storage');
  }

  const localValueUpdated =
    parsedLocalValue && parsedLocalValue.updated
      ? new Date(parsedLocalValue.updated)
      : null;

  const oneHourInMS = 1000 * 60 * 60;
  const localValueIsStale = localValueUpdated
    ? new Date() - localValueUpdated > oneHourInMS
    : true;

  const shouldRefetchData =
    localValueIsStale || parsedLocalValue.userId !== action.payload.user_id;

  if (shouldRefetchData) {
    let response = yield call(
      api.catalog.fetchRecentDatasets,
      action.payload.user_id,
    );
    if (response && Array.isArray(response)) {
      yield put(catalogActions.recentRecsRequestSuccess(response));
    } else {
      yield put(catalogActions.recentRecsRequestFailure(response));
      yield put(
        interfaceActions.snackbarOpen(
          'Failed to retrieve recent datasets.',
          tag,
        ),
      );
    }
  } else {
    console.log('cache hit: recent datasets');
    yield put(catalogActions.recentRecsCacheHit(parsedLocalValue.data));
  }
}

function* fetchRecommendedDatasets(action) {
  const tag = { tag: 'fetchRecommendedDatasets' };

  // check cache
  const localValue = localStorageApi.get('seeAlsoRecs');
  let parsedLocalValue;
  try {
    parsedLocalValue = JSON.parse(localValue);
  } catch (e) {
    console.log('error parsing string from local storage');
  }

  const localValueUpdated =
    parsedLocalValue && parsedLocalValue.updated
      ? new Date(parsedLocalValue.updated)
      : null;

  const oneHourInMS = 1000 * 60 * 60;
  const localValueIsStale = localValueUpdated
    ? new Date() - localValueUpdated > oneHourInMS
    : true;

  const shouldRefetchData =
    localValueIsStale || parsedLocalValue.userId !== action.payload.user_id;

  if (shouldRefetchData) {
    // fetch data from server
    let response = yield call(
      api.catalog.fetchRecommendedDatasets,
      action.payload.user_id,
    );
    if (response && Array.isArray(response)) {
      yield put(catalogActions.recommendedRecsRequestSuccess(response));
    } else {
      yield put(catalogActions.recommendedRecsRequestFailure(response));
      yield put(
        interfaceActions.snackbarOpen(
          'Failed to retrieve recommended datasets.',
          tag,
        ),
      );
    }
  } else {
    console.log('seeAlso: cache hit');
    yield put(catalogActions.recommendedRecsCacheHit(parsedLocalValue.data));
  }
}

/************** Dataset Detail Page **********************/

function* datasetFullPageDataFetch(action) {
  const tag = { tag: 'datasetFullPageFetch' };

  yield put(
    catalogActions.datasetFullPageDataSetLoadingState(states.inProgress),
  );
  // fullpage data returns Dasaset info and Cruises
  // Dataset info resolves any enum values from reference tables
  // and pulls in dataset stats for spacetime min/max data,
  // row count, keywords, regions, visualizable flag
  // sensors and unstructure metadata
  let result = yield call(
    api.catalog.datasetFullPageDataFetch,
    action.payload.shortname,
  );

  if (result.ok) {
    let results = yield result.json();
    yield put(catalogActions.datasetFullPageDataStore(results));
    yield put(
      catalogActions.datasetFullPageDataSetLoadingState(states.succeeded),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve information. Please try again later.',
        tag,
      ),
    );
    yield put(catalogActions.datasetFullPageDataSetLoadingState(states.failed));
  }
}

function* datasetVariablesFetch(action) {
  const tag = { tag: 'datasetVariablesFetch' };

  yield put(catalogActions.datasetVariablesSetLoadingState(states.inProgress));

  let result = yield call(
    api.catalog.datasetVariablesFetch, // api calls uspVariableCatalog for dataset
    action.payload.shortname,
  );

  if (result.ok) {
    let results = yield result.json();
    yield put(
      catalogActions.datasetVariablesStore(results, action.payload.shortname),
    );
    yield put(catalogActions.datasetVariablesSetLoadingState(states.succeeded));
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve dataset variables. Please try again later.',
        tag,
      ),
    );
    yield put(catalogActions.datasetVariablesSetLoadingState(states.failed));
  }
}

// um
function* datasetVariableUMFetch(action) {
  const tag = { tag: 'datasetVariableUMFetch' };

  yield put(catalogActions.datasetVariableUMSetLoadingState(states.inProgress));

  let result = yield call(
    api.catalog.datasetVariableUMFetch,
    action.payload.shortname,
  );

  if (result.ok) {
    let results = yield result.json();
    yield put(catalogActions.datasetVariableUMStore(results));
    yield put(
      catalogActions.datasetVariableUMSetLoadingState(states.succeeded),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve variable metadata.',
        tag,
      ),
    );
    yield put(catalogActions.datasetVariableUMSetLoadingState(states.failed));
  }
}

function* cruiseFullPageDataFetch(action) {
  const tag = { tag: 'cruiseFullPageFetch' };

  yield put(
    catalogActions.cruiseFullPageDataSetLoadingState(states.inProgress),
  );
  let result = yield call(
    api.catalog.cruiseFullPageDataFetch,
    action.payload.name,
  );

  if (result.ok) {
    let results = yield result.json();
    yield put(catalogActions.cruiseFullPageDataStore(results));
    yield put(
      catalogActions.cruiseFullPageDataSetLoadingState(states.succeeded),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Failed to retrieve information. Please try again later.',
        tag,
      ),
    );
    yield put(catalogActions.cruiseFullPageDataSetLoadingState(states.failed));
  }
}

function* vizSearchResultsFetch(action) {
  const tag = { tag: 'vizSearchResultsFetch' };

  const { params } = action.payload;

  const qString =
    '?' +
    queryString.stringify({
      ...params,
      sensor: Array.from(params.selectedSensors || new Set()),
      make: Array.from(params.selectedMakes || new Set()),
      region: Array.from(params.selectedRegions || new Set()),
    });

  const searchResponse = yield call(api.visualization.variableSearch, qString);
  const storedOptions = yield select((state) => state.submissionOptions);

  if (searchResponse.ok) {
    const { counts, variables } = yield searchResponse.json();
    let options = buildSearchOptionsFromVariablesList(
      variables,
      storedOptions,
      params,
    );
    let datasets = groupVariablesByDataset(variables);
    let makes = groupDatasetsByMake(datasets);
    yield put(
      visualizationActions.vizSearchResultsStoreAndUpdateOptions(
        makes,
        options,
        counts,
      ),
    );
    yield put(
      visualizationActions.vizSearchResultsSetLoadingState(states.succeeded),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen('Search failed. Please try again.', tag),
    );
  }
}

function* memberVariablesFetch(action) {
  const tag = { tag: 'memberVariablesFetch' };
  let response = yield call(
    api.visualization.memberVariablesFetch,
    action.payload.datasetID,
  );

  if (response.ok) {
    let variables = yield response.json();
    yield put(visualizationActions.memberVariablesStore(variables));
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Unable to get variables at this time',
        tag,
      ),
    );
  }
}

function* autocompleteVariableNamesFetch(action) {
  if (!action.payload.terms) {
    yield put(visualizationActions.variableNameAutocompleteStore([]));
    return;
  }

  let response = yield call(
    api.visualization.autocompleteVariableNamesFetch,
    encodeURIComponent(action.payload.terms),
  );

  if (response.ok) {
    let jsonResponse = yield response.json();
    yield put(visualizationActions.variableNameAutocompleteStore(jsonResponse));
  }
}

// variable stats dialog
function* variableFetch(action) {
  const tag = { tag: 'variableFetch' };

  if (action.payload.id === null) {
    yield put(visualizationActions.variableStore(null));
  } else {
    yield put(
      visualizationActions.variableFetchSetLoadingState(states.inProgress),
    );

    let response = yield call(
      api.visualization.variableFetch,
      action.payload.id,
    );

    if (response.ok) {
      let variableDetails = yield response.json();
      yield put(visualizationActions.variableStore(variableDetails));
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'Unable to fetch variable details. Please try again later',
          tag,
        ),
      );
    }
  }
}

function* datasetSummaryFetch(action) {
  const tag = { tag: 'datasetSummaryFetch' };

  if (action.payload.id === null) {
    yield put(visualizationActions.datasetSummaryStore(null));
  } else {
    let response = yield call(
      api.visualization.datasetSummaryFetch,
      action.payload.id,
    );

    if (response.ok) {
      let datasetSummary = yield response.json();
      yield put(visualizationActions.datasetSummaryStore(datasetSummary));
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'Unable to fetch dataset summary. Please try again later',
          tag,
        ),
      );
    }
  }
}

function* vizPageDataTargetSetAndFetchDetails(action) {
  const tag = { tag: 'vizPageDataTargetSetAndFetchDetails' };
  yield put(
    visualizationActions.vizPageDataTargetSet(action.payload.vizPageDataTarget),
  );
  if (action.payload.vizPageDataTarget === null) {
    return;
  }

  let response = yield call(
    api.visualization.variableFetch,
    action.payload.vizPageDataTarget.ID,
  );

  if (response.ok) {
    let variableDetails = yield response.json();
    yield put(
      visualizationActions.vizPageDataTargetDetailsStore(variableDetails),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        'Unable to fetch variable details. Please try again later',
        tag,
      ),
    );
  }
}

function* dataSubmissionDelete(action) {
  const tag = { tag: 'dataSubmissionDelete' };
  let result = yield call(
    api.dataSubmission.deleteSubmission,
    action.payload.submission.Submission_ID,
  );

  if (result.ok) {
    yield put(dataSubmissionActions.retrieveAllSubmissions());
    yield put(
      interfaceActions.snackbarOpen(
        `Successfully deleted ${action.payload.submission.Dataset}`,
        tag,
      ),
    );
  } else {
    yield put(
      interfaceActions.snackbarOpen(
        `Failed to delete ${action.payload.submission.Dataset}`,
        tag,
      ),
    );
  }
}

function* sparseDataQuerySend(action) {
  const tag = { tag: 'sparseDataQuerySend' };

  yield put(interfaceActions.setLoadingMessage('Fetching Data', tag));

  let result = yield call(
    api.visualization.sparseDataQuerysend,
    action.payload,
  );
  yield delay(50);
  yield put(interfaceActions.setLoadingMessage('Processing Data', tag));
  yield delay(70);

  // Result will be an object containing variable values and describing data shape
  if (result.failed) {
    yield put(interfaceActions.setLoadingMessage('', tag));
    yield put(visualizationActions.storedProcedureRequestFailure());
    if (result.status === 401) {
      yield put(userActions.refreshLogin());
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'An unexpected error occurred. Please reduce the size of your query and try again.',
          tag,
        ),
      );
    }
  } else {
    if (result.variableValues.length > 0) {
      result.finalize();
      yield put(visualizationActions.handleGuestVisualization());
      yield put(interfaceActions.setLoadingMessage('', tag));
      yield put(visualizationActions.storedProcedureRequestSuccess());
      yield put(visualizationActions.triggerShowCharts());
      yield put(
        visualizationActions.addChart({
          subType: action.payload.subType,
          data: result,
        }),
      );
      if (result.variableValues.length >= SPARSE_DATA_QUERY_MAX_SIZE) {
        yield put(
          visualizationActions.sparseDataMaxSizeNotificationUpdate(
            lastRowTimeSpaceDataFromChart(result),
          ),
        );
        window.scrollTo(0, 0);
      }
    } else {
      yield put(interfaceActions.setLoadingMessage('', tag));
      yield put(
        interfaceActions.snackbarOpen(
          `No data found for ${action.payload.parameters.fields} in the requested ranges. Try selecting a different date or depth range.`,
          tag,
        ),
      );
    }
  }
}

function* errorReportSend(action) {
  yield call(api.community.errorReport, action.payload);
}

function* handleGuestVisualization() {
  // Checks for user. Increments guest plot count. Shows dialog when limit reached
  var userInfo = Cookies.get('UserInfo');
  if (userInfo) {
    return;
  }

  let guestPlotCount = parseInt(Cookies.get('guestPlotCount'));
  let expires = new Date();
  expires.setHours(24, 0, 0, 0);
  Cookies.set('guestPlotCount', guestPlotCount ? guestPlotCount + 1 : 1, {
    expires,
  });

  log.debug('handleGuestVisualization', { guestPlotCount });

  if (guestPlotCount >= 9) {
    yield put(
      visualizationActions.guestPlotLimitNotificationSetIsVisible(true),
    );
  } else {
    //
  }
}

function* guestTokenRequestSend() {
  const tag = { tag: 'guestTokenRequestSend' };
  log.debug('guestTokenRequestSend', {});

  let userIsGuest = yield select((state) => state.userIsGuest);

  if (userIsGuest) {
    yield put(
      visualizationActions.guestPlotLimitNotificationSetIsVisible(false),
    );
  } else {
    let expires = new Date();
    expires.setHours(24, 0, 0, 0);

    let result = yield call(api.user.getGuestToken, expires.valueOf());

    if (result.status === 200) {
      yield put(interfaceActions.hideLoginDialog());
      yield put(userActions.userIsGuestSet(true));
      yield put(
        visualizationActions.guestPlotLimitNotificationSetIsVisible(false),
      );
    } else {
      yield put(
        interfaceActions.snackbarOpen(
          'Guest login is currently unavailable. Please try again later, log in, or register a new account. ',
          tag,
        ),
      );
    }
  }
}

function* ingestCookies() {
  let state = {};

  if (Cookies.get('guestToken')) {
    state['userIsGuest'] = true;
  }
  yield put(userActions.updateStateFromCookies(state));
}

// Dataset Features

function* fetchDatasetFeatures() {
  let data = yield select((state) => state.catalog.datasetFeatures);

  // if not, fetch it
  if (!data) {
    log.debug('fetching dataset features', { store: data });
    let fetchedData = yield call(api.catalog.getDatasetFeatures);
    log.debug('fetched data', fetchedData);
    if (fetchedData) {
      yield put({
        type: catalogActionTypes.FETCH_DATASET_FEATURES_SUCCESS,
        payload: fetchedData,
      });
      yield put({
        type: catalogActionTypes.UPDATE_CATALOG_WITH_DATASET_FEATURES,
      });
    } else {
      yield put({
        type: catalogActionTypes.FETCH_DATASET_FEATURES_FAILURE,
      });
    }
  }
}

function* updateCatalogWithDatasetFeatures() {
  let searchResults = yield select((state) => state.searchResults);
  let submissionOptions = yield select((state) => state.submissionOptions);
  // let searchOptions = yield select((state) => state.searchOptions);
  let datasetFeatures = yield select((state) => state.catalog.datasetFeatures);
  let params = queryString.parse(window.location.search);
  log.debug('updateCatalogWithDatasetFeatures', { params });

  // 1. update the results

  let results = ammendSearchResults(searchResults, datasetFeatures);

  // 2. rebuild the options

  // when this is called, we don't want any options altered
  // except ci/ancillary -- which could be removed if
  // there are no matching results
  let options = buildSearchOptionsFromDatasetList(
    searchResults,
    submissionOptions, //
    params, // parsed query string
  );

  yield put(catalogActions.searchResultsStore(results, options));
}

function* watchFetchDatasetFeatures() {
  yield takeLatest(
    catalogActionTypes.FETCH_DATASET_FEATURES,
    fetchDatasetFeatures,
  );
}

function* watchUpdateCatalogWithDatasetFeatures() {
  yield takeLatest(
    catalogActionTypes.UPDATE_CATALOG_WITH_DATASET_FEATURES,
    updateCatalogWithDatasetFeatures,
  );
}

// Continuous Ingestion

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function* watchQueryRequest() {
  yield takeLatest(visualizationActionTypes.QUERY_REQUEST_SEND, queryRequest);
}

function* watchStoredProcedureRequest() {
  yield takeLatest(
    visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND,
    storedProcedureRequest,
  );
}

function* watchStoredProcedureRequest2() {
  yield takeLatest(
    visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND,
    updateLoadingMessage,
  );
}

function* watchCruiseTrajectoryRequest() {
  yield takeLatest(
    visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SEND,
    cruiseTrajectoryRequest,
  );
}

function* watchCruiseListRequest() {
  yield takeLatest(
    visualizationActionTypes.CRUISE_LIST_REQUEST_SEND,
    cruiseListRequest,
  );
}

function* watchTableStatsRequest() {
  yield takeLatest(
    visualizationActionTypes.TABLE_STATS_REQUEST_SEND,
    tableStatsRequest,
  );
}

function* watchCsvDownloadRequest() {
  yield takeLatest(
    visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SEND,
    csvDownloadRequest,
  );
}

function* watchDownloadRequest() {
  yield takeLatest(
    catalogActionTypes.DATASET_DOWNLOAD_REQUEST_SEND,
    downloadRequest,
  );
}

function* watchRefreshLogin() {
  yield takeLatest(userActionTypes.REFRESH_LOGIN, refreshLogin);
}

function* watchUpdateUserInfoRequest() {
  yield takeLatest(
    userActionTypes.UPDATE_USER_INFO_REQUEST_SEND,
    updateUserInfoRequest,
  );
}

function* watchRecoverPasswordRequest() {
  yield takeLatest(
    userActionTypes.RECOVER_PASSWORD_REQUEST_SEND,
    recoverPasswordRequest,
  );
}

function* watchChoosePasswordRequest() {
  yield takeLatest(
    userActionTypes.CHOOSE_PASSWORD_REQUEST_SEND,
    choosePasswordRequest,
  );
}

function* watchChangePasswordRequest() {
  yield takeLatest(
    userActionTypes.CHANGE_PASSWORD_REQUEST_SEND,
    changePasswordRequest,
  );
}

function* watchChangeEmailRequest() {
  yield takeLatest(
    userActionTypes.CHANGE_EMAIL_REQUEST_SEND,
    changeEmailRequest,
  );
}

function* watchCsvFromVizRequest() {
  yield takeLatest(
    visualizationActionTypes.CSV_FROM_VIZ_REQUEST_SEND,
    csvFromVizRequest,
  );
}

function* watchCopyTextToClipboard() {
  yield takeLatest(
    interfaceActionTypes.COPY_TEXT_TO_CLIPBOARD,
    copyTextToClipboard,
  );
}

function* watchRetrieveSubmissionsByUser() {
  yield takeLatest(
    dataSubmissionActionTypes.RETRIEVE_SUBMISSIONS_BY_USER,
    retrieveSubmissionsByUser,
  );
}

function* watchRetrieveAllSubmissions() {
  yield takeLatest(
    dataSubmissionActionTypes.RETRIEVE_ALL_SUBMISSIONS,
    retrieveAllSubmissions,
  );
}

function* watchAddSubmissionComment() {
  yield takeLatest(
    dataSubmissionActionTypes.ADD_SUBMISSION_COMMENT,
    addSubmissionComment,
  );
}

function* watchRetrieveSubmissionCommentHistory() {
  yield takeLatest(
    dataSubmissionActionTypes.RETRIEVE_SUBMISSION_COMMENT_HISTORY,
    retrieveSubmissionCommentHistory,
  );
}

function* watchUploadSubmission() {
  yield takeLatest(
    dataSubmissionActionTypes.UPLOAD_SUBMISSION,
    uploadSubmission,
  );
}

function* watchSetDataSubmissionPhase() {
  yield takeLatest(
    dataSubmissionActionTypes.SET_SUBMISSION_PHASE,
    setDataSubmissionPhase,
  );
}

function* watchRetrieveMostRecentFile() {
  yield takeLatest(
    dataSubmissionActionTypes.RETRIEVE_MOST_RECENT_FILE,
    retrieveMostRecentFile,
  );
}

function* watchCheckSubmissionOptionsAndStoreFile() {
  yield takeLatest(
    dataSubmissionActionTypes.CHECK_SUBMISSION_OPTIONS_AND_STORE_FILE,
    checkSubmissionOptionsAndStoreFile,
  );
}

function* watchDownloadMostRecentFile() {
  yield takeLatest(
    dataSubmissionActionTypes.DOWNLOAD_MOST_RECENT_FILE,
    downloadMostRecentFile,
  );
}

function* watchKeywordsFetch() {
  yield takeLatest(catalogActionTypes.KEYWORDS_FETCH, keywordsFetch);
}

function* watchSearchOptionsFetch() {
  yield takeLatest(catalogActionTypes.SEARCH_OPTIONS_FETCH, searchOptionsFetch);
}

function* watchSearchResultsFetch() {
  yield debounce(
    450,
    catalogActionTypes.SEARCH_RESULTS_FETCH,
    searchResultsFetch,
  );
}

function* watchPopularDatasetsFetch() {
  yield takeLatest(
    catalogActionTypes.FETCH_RECS_POPULAR_SEND,
    fetchPopularDatasets,
  );
}

function* watchRecentDatasetsFetch() {
  yield takeLatest(
    catalogActionTypes.FETCH_RECS_RECENT_SEND,
    fetchRecentDatasets,
  );
}

function* watchRecommendedDatasetsFetch() {
  yield takeLatest(
    catalogActionTypes.FETCH_RECS_RECOMMENDED_SEND,
    fetchRecommendedDatasets,
  );
}

function* watchDatasetFullPageDataFetch() {
  yield takeLatest(
    catalogActionTypes.DATASET_FULL_PAGE_DATA_FETCH,
    datasetFullPageDataFetch,
  );
}

function* watchDatasetVariablesFetch() {
  yield takeLatest(
    catalogActionTypes.DATASET_VARIABLES_FETCH,
    datasetVariablesFetch,
  );
}

function* watchDatasetVariableUMFetch() {
  yield takeLatest(
    catalogActionTypes.DATASET_VARIABLE_UM_FETCH,
    datasetVariableUMFetch,
  );
}

function* watchCruiseFullPageDataFetch() {
  yield takeLatest(
    catalogActionTypes.CRUISE_FULL_PAGE_DATA_FETCH,
    cruiseFullPageDataFetch,
  );
}

function* watchVizSearchResultsFetch() {
  yield debounce(
    450,
    visualizationActionTypes.VIZ_SEARCH_RESULTS_FETCH,
    vizSearchResultsFetch,
  );
}

function* watchMemberVariablesFetch() {
  yield takeLatest(
    visualizationActionTypes.MEMBER_VARIABLES_FETCH,
    memberVariablesFetch,
  );
}

function* watchAutocompleteVariableNamesFetch() {
  yield debounce(
    300,
    visualizationActionTypes.VARIABLE_NAME_AUTOCOMPLETE_FETCH,
    autocompleteVariableNamesFetch,
  );
}

function* watchVariableFetch() {
  yield takeLatest(visualizationActionTypes.VARIABLE_FETCH, variableFetch);
}

function* watchDatasetSummaryFetch() {
  yield takeLatest(
    visualizationActionTypes.DATASET_SUMMARY_FETCH,
    datasetSummaryFetch,
  );
}

function* watchVizPageDataTargetSetAndFetchDetails() {
  yield takeLatest(
    visualizationActionTypes.VIZ_PAGE_DATA_TARGET_SET_AND_FETCH_DETAILS,
    vizPageDataTargetSetAndFetchDetails,
  );
}

function* watchDataSubmissionSelectOptionsFetch() {
  yield takeLatest(
    dataSubmissionActionTypes.DATA_SUBMISSION_SELECT_OPTIONS_FETCH,
    fetchSubmissionOptions,
  );
}

function* watchDataSubmissionDelete() {
  yield takeLatest(
    dataSubmissionActionTypes.DATA_SUBMISSION_DELETE,
    dataSubmissionDelete,
  );
}

function* watchSparseDataQuerySend() {
  yield takeLatest(
    visualizationActionTypes.SPARSE_DATA_QUERY_SEND,
    sparseDataQuerySend,
  );
}

function* watchErrorReportSend() {
  yield takeLatest(communityActionTypes.ERROR_REPORT_SEND, errorReportSend);
}

function* watchHandleGuestVisualization() {
  yield takeLatest(
    visualizationActionTypes.HANDLE_GUEST_VISUALIZATION,
    handleGuestVisualization,
  );
}

function* watchGuestTokenRequestSend() {
  yield takeLatest(
    userActionTypes.GUEST_TOKEN_REQUEST_SEND,
    guestTokenRequestSend,
  );
}

function* watchIngestCookies() {
  yield takeLatest(userActionTypes.INGEST_COOKIES, ingestCookies);
}

function* watchChangeNewsSubscription() {
  yield takeLatest(
    userActionTypes.CHANGE_NEWS_SUBSCRIPTION,
    updateUserInfoRequest, // use update profile saga
  );
}

function* rootSaga() {
  yield all([
    watchUserLogin(),
    watchUserRegistration(),
    watchUserValidation(),
    watchUserLogout(),
    watchGoogleLoginRequest(),
    watchGoogleLoginRequestFailure(),
    watchKeyRetrieval(),
    watchKeyCreationRequest(),
    watchQueryRequest(),
    watchStoredProcedureRequest(),
    watchStoredProcedureRequest2(),
    watchCruiseTrajectoryRequest(),
    watchCruiseListRequest(),
    watchTableStatsRequest(),
    watchCsvDownloadRequest(),
    watchRefreshLogin(),
    watchUpdateUserInfoRequest(),
    // watchPromptGoogleLogin(),
    watchRecoverPasswordRequest(),
    watchChoosePasswordRequest(),
    watchContactUs(),
    watchNominateNewData(),
    watchChangePasswordRequest(),
    watchChangeEmailRequest(),
    watchCsvFromVizRequest(),
    watchDownloadRequest(),
    watchCopyTextToClipboard(),
    watchRetrieveSubmissionsByUser(),
    watchRetrieveAllSubmissions(),
    watchAddSubmissionComment(),
    watchRetrieveSubmissionCommentHistory(),
    watchUploadSubmission(),
    watchSetDataSubmissionPhase(),
    watchRetrieveMostRecentFile(),
    watchCheckSubmissionOptionsAndStoreFile(),
    watchDownloadMostRecentFile(),
    watchKeywordsFetch(),
    watchSearchOptionsFetch(),
    watchSearchResultsFetch(),
    watchPopularDatasetsFetch(),
    watchRecentDatasetsFetch(),
    watchRecommendedDatasetsFetch(),
    watchDatasetFullPageDataFetch(),
    watchDatasetVariablesFetch(),
    watchDatasetVariableUMFetch(),
    watchCruiseFullPageDataFetch(),
    watchVizSearchResultsFetch(),
    watchMemberVariablesFetch(),
    watchAutocompleteVariableNamesFetch(),
    watchVariableFetch(),
    watchDatasetSummaryFetch(),
    watchVizPageDataTargetSetAndFetchDetails(),
    watchDataSubmissionSelectOptionsFetch(),
    watchDataSubmissionDelete(),
    watchSparseDataQuerySend(),
    watchErrorReportSend(),
    watchHandleGuestVisualization(),
    watchGuestTokenRequestSend(),
    watchIngestCookies(),
    watchRequestNewsList(),
    watchUpdateNewsItem(),
    watchUpdateNewsItemSuccess(),
    watchPublishNewsItem(),
    watchPublishNewsItemSuccess(),
    watchPreviewNewsItem(),
    watchPreviewNewsItemSuccess(),
    watchUnpublishNewsItem(),
    watchUnpublishNewsItemSuccess(),
    watchDraftNewsItem(),
    watchDraftNewsItemSuccess(),
    watchCreateNewsItem(),
    watchCreateNewsItemSuccess(),
    watchUpdateNewsRanks(),
    watchUpdateNewsRanksSuccess(),
    watchFeatureNewsItem(),
    watchFeatureNewsItemSuccess(),
    watchCategorizeNewsItem(),
    watchCategorizeNewsItemSuccess(),
    // watchFetchTablesWithCI(),
    // watchFetchTablesWithCISuccess(),
    watchFetchDatasetFeatures(),
    watchUpdateCatalogWithDatasetFeatures(),
    watchCheckDownloadSize(),
    watchRequestHighlightsSend(),
    watchRequestTrajectoryPointCounts(),
    // watchRequestSSTAnomalyDataSend(),
    // watchRequestADTAnomalyDataSend(),
    watchRequestAvgSSTAnomalyDataSend(),
    watchRequestAvgADTAnomalyDataSend(),
    watchFetchLastUserTouch(),
    watchCheckSubmissionNameRequestSend(),
    watchVisualizableVariablesFetch(),
    watchDatasetVariableVisDataFetch(),
    watchFetchProgramsSend(),
    watchFetchProgramDetailsSend(),
    watchProgramSampleVisDataFetch(),
    watchFetchUserSubscriptions(),
    watchCreateSubscription(),
    watchDeleteSubscriptions(),
    watchFetchDatasetNames(),
    watchFetchNotificationHistory(),
    watchFetchNotificationProjection(),
    watchChangeNewsSubscription(),
    watchFetchNotificationPreviews(),
    watchSendNotifications(),
    watchReSendNotifications(),
    watchDownloadDialogOpen(),
    watchFetchVaultLink(),
    watchCheckVizQuerySize(),
  ]);
}

export default rootSaga;
