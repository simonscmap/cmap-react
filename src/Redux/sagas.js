import { put, takeLatest, all, call, delay } from 'redux-saga/effects';
// import { eventChannel } from 'redux-saga';
import Cookies from 'js-cookie';
// import worker from '../worker';

import * as userActions from './actions/user';
import * as catalogActions from './actions/catalog';
import * as interfaceActions from './actions/ui';
import * as visualizationActions from './actions/visualization';

import * as userActionTypes from './actionTypes/user';
import * as catalogActionTypes from './actionTypes/catalog';
import * as visualizationActionTypes from './actionTypes/visualization';

import api from '../api';

function* userLogin(action) {
    yield put(userActions.userLoginRequestProcessing());
    let result = yield call(api.user.login, action.payload);
    
    if(result.ok){
        var userInfo = JSON.parse(Cookies.get('UserInfo'));
        yield put(userActions.userLoginRequestSuccess());
        yield put(interfaceActions.hideLoginDialog());
        yield put(userActions.storeInfo(userInfo));
        yield put(interfaceActions.snackbarOpen('Login was successful!'))
    } else {
        yield put(userActions.userLoginRequestFailure());
        yield put(interfaceActions.snackbarOpen('Login failed.'));
    }
}

function* userLogout(){    
    yield call(api.user.logout);
    yield put(userActions.destroyInfo());
    yield put(interfaceActions.snackbarOpen('You have logged out.'))
}

function* userRegistration(action){
    yield put(userActions.userRegistrationRequestProcessing());
    let result = yield call(api.user.register, action.payload);
    
    if(result.ok){
        yield put(interfaceActions.registrationNextActiveStep());
        yield put(userActions.userRegistrationRequestSuccess());
        yield put(interfaceActions.snackbarOpen('Registration was successful. Please log in.'));
        yield put(interfaceActions.showLoginDialog());
    } else {
        yield put(userActions.userRegistrationRequestFailure());
        yield put(interfaceActions.snackbarOpen('Registration failed.'))
    }
}

function* userValidation(action){
    yield put(userActions.userValidationRequestProcessing());
    let result = yield call(api.user.validate, action.payload);
    let isValid = yield result.json();
    
    if(isValid){
        yield put(userActions.userValidationRequestSuccess());
        yield put(interfaceActions.registrationNextActiveStep());
    } else {
        yield put(userActions.userValidationRequestFailure());
    }
}

function* catalogRetrieval(){
    yield put(catalogActions.retrievalRequestProcessing());
    let catalog = yield call(api.catalog.retrieve);
    
    if(!catalog) {
        yield put(catalogActions.retrievalRequestFailure());
    } else{
        yield put(catalogActions.retrievalRequestSuccess(catalog));
    }
}

function* datasetRetrieval(){
    yield put(catalogActions.datasetRetrievalRequestProcessing());
    let datasets = yield call(api.catalog.datasets);

    if(!datasets){
        yield put(catalogActions.retrievalRequestFailure());
    } else {
        yield put(catalogActions.datasetRetrievalRequestSuccess(datasets));
    }
}

function* keyRetrieval(action){
    let result = yield call(api.user.keyRetrieval);
    
    if(!result){
        yield put(userActions.keyRetrievalRequestFailure());
        yield put(interfaceActions.snackbarOpen('API Key Retrieval Failed'));
    } else {
        yield put(userActions.keyRetrievalRequestSuccess(result.keys));
    }
}

function* keyCreation(action){
    yield put(userActions.keyCreationRequestProcessing());
    let result = yield call(api.user.keyCreation, action.payload.description);
    
    if(!result.ok) yield put(interfaceActions.snackbarOpen("We were unable to create a new API key."));
    else {
        yield put(interfaceActions.snackbarOpen("A new API key was created"));
        yield put(userActions.keyCreationRequestSuccess());
        yield put(userActions.keyRetrievalRequestSend());        
    }
}

function* queryRequest(action){
    yield put(visualizationActions.queryRequestProcessing());
    let result = yield call(api.visualization.queryRequest, action.payload.query);
    yield put(visualizationActions.storeSampleData(result));
    yield put(visualizationActions.queryRequestSuccess());
}

function* storedProcedureRequest(action){
    yield put(visualizationActions.storedProcedureRequestProcessing());
    yield put(interfaceActions.setLoadingMessage('Fetching Data'));
    let result = yield call(api.visualization.storedProcedureRequest, action.payload);
    yield delay(50);
    yield put(interfaceActions.setLoadingMessage('Processing Data'));
    yield delay(70);
    
    // Result will be an object containing variable values and describing date shape
    if(result.failed){
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(visualizationActions.storedProcedureRequestFailure());
        if(result.status == 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen("An error occurred. Please try again."));
        }
    } else {
        if(result.variableValues.length > 0){
            result.finalize();
            yield put(interfaceActions.setLoadingMessage(''));
            yield put(visualizationActions.storedProcedureRequestSuccess());
            // yield put(interfaceActions.snackbarOpen(`${action.payload.subType} ${action.payload.parameters.fields} is ready`));
            yield put(visualizationActions.triggerShowCharts());
            yield put(visualizationActions.addChart({subType: action.payload.subType, data:result}));
           
        } else {
            yield put(interfaceActions.setLoadingMessage(''));
            yield put(interfaceActions.snackbarOpen(`No data found for ${action.payload.parameters.fields} in the requested ranges. Try selecting a different date or depth range.`));
        }
    }
}

function* cruiseTrajectoryRequest(action) {
    yield put(visualizationActions.cruiseTrajectoryRequestProcessing());
    yield put(interfaceActions.setLoadingMessage('Fetching Cruise Data'));
    let result = yield call(api.visualization.cruiseTrajectoryRequest, action.payload);
    yield put(interfaceActions.setLoadingMessage(''));

    if(result.failed){
        if(result.status == 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen(`Unable to Fetch Cruise Data`));
        }
    } else {
        yield put(visualizationActions.cruiseTrajectoryRequestSuccess(result));
        yield put(interfaceActions.setLoadingMessage(''));
    }
}

function* cruiseListRequest() {
    yield put(visualizationActions.cruiseListRequestProcessing());
    let cruiseList = yield call(api.visualization.cruiseList);

    if(!cruiseList) {
        yield put(visualizationActions.cruiseListRequestFailure());
    } else{
        yield put(visualizationActions.cruiseListRequestSuccess(cruiseList));
    }
}

function* tableStatsRequest(action){
    yield put(visualizationActions.tableStatsRequestProcessing());
    yield put(interfaceActions.setLoadingMessage('Fetching Dataset Information'));
    let result = yield call(api.visualization.getTableStats, action.payload.tableName);
    yield put(interfaceActions.setLoadingMessage(''));

    if(result.failed){
        if(result.status == 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen(`Unable to Fetch Dataset Information`));
        }
    } else {
        yield put(visualizationActions.tableStatsRequestSuccess(result, action.payload.datasetLongName));
    }
}

function* csvDownloadRequest(action){
    yield put(visualizationActions.csvDownloadRequestProcessing());
    yield put(interfaceActions.setLoadingMessage('Fetching Data'));
    let response = yield call(api.visualization.csvDownload, action.payload);
    yield put(interfaceActions.setLoadingMessage(''))
    if(response.failed) {
        if(response.status == 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen('An error occurred. Please try again.'))
        }
    } else {
        yield put(visualizationActions.downloadTextAsCsv(response, action.payload.fileName));
    }
}

function* downloadTextAsCsv(action){
    yield put(interfaceActions.setLoadingMessage('Processing Data'))
    let csv = action.payload.text;
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${action.payload.datasetName}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    yield put(interfaceActions.setLoadingMessage(''));
}

function* refreshLogin(){
    yield call(api.user.logout);
    yield put(userActions.destroyInfo());
    yield put(interfaceActions.showLoginDialog());
    yield put(interfaceActions.snackbarOpen("Your session has expired. Please log in again."));
}

function* watchUserLogin() {
    yield takeLatest(userActionTypes.LOGIN_REQUEST_SEND, userLogin);
}

function * watchUserLogout() {
    yield takeLatest(userActionTypes.LOG_OUT, userLogout)
}

function* watchUserRegistration() {
    yield takeLatest(userActionTypes.REGISTRATION_REQUEST_SEND, userRegistration);
}

function* watchUserValidation(){
    yield takeLatest(userActionTypes.VALIDATION_REQUEST_SEND, userValidation);
}

function* watchCatalogRetrieval(){
    yield takeLatest(catalogActionTypes.RETRIEVAL_REQUEST_SEND, catalogRetrieval);
}

function* watchDatasetRetrieval(){
    yield takeLatest(catalogActionTypes.DATASET_RETRIEVAL_REQUEST_SEND, datasetRetrieval);
}

function* watchKeyRetrieval(){
    yield takeLatest(userActionTypes.KEY_RETRIEVAL_REQUEST_SEND, keyRetrieval);
}

function* watchKeyCreationRequest(){
    yield takeLatest(userActionTypes.KEY_CREATION_REQUEST_SEND, keyCreation);
}

function* watchQueryRequest(){
    yield takeLatest(visualizationActionTypes.QUERY_REQUEST_SEND, queryRequest);
}

function* watchStoredProcedureRequest(){
    yield takeLatest(visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND, storedProcedureRequest);
}

function* watchCruiseTrajectoryRequest(){
    yield takeLatest(visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SEND, cruiseTrajectoryRequest);
}

function* watchCruiseListRequest(){
    yield takeLatest(visualizationActionTypes.CRUISE_LIST_REQUEST_SEND, cruiseListRequest);
}

function* watchTableStatsRequest(){
    yield takeLatest(visualizationActionTypes.TABLE_STATS_REQUEST_SEND, tableStatsRequest)
}

function* watchCsvDownloadRequest(){
    yield takeLatest(visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SEND, csvDownloadRequest);
}

function* watchDownloadTextAsCsv(){
    yield takeLatest(visualizationActionTypes.DOWNLOAD_TEXT_AS_CSV, downloadTextAsCsv);
}

function* watchRefreshLogin(){
    yield takeLatest(userActionTypes.REFRESH_LOGIN, refreshLogin);
}

// function createWorkerChannel(worker) {
//     return eventChannel(emit => {
//         worker.onmessage = message => {
//             emit(message);
//         }

//         const unsubscribe = () => {
//             worker.teminate();
//         }
      
//         return unsubscribe;
//     })
// }

// function* watchWorkerChannel(){
//     const workerChannel = yield call(createWorkerChannel, worker);

//     while (true) {
//         const message = yield take(workerChannel);
//         yield put(message.data.type, message.data.payload);
//         //   yield put({ type: INCOMING_PONG_PAYLOAD, payload })
//         //   yield fork(pong, socket)
//       }
// }

export default function* rootSaga() {
    yield all([
        watchUserLogin(),
        watchUserRegistration(),
        watchUserValidation(),
        watchUserLogout(),
        watchCatalogRetrieval(),
        watchDatasetRetrieval(),
        watchKeyRetrieval(),
        watchKeyCreationRequest(),
        watchQueryRequest(),
        watchStoredProcedureRequest(),
        watchCruiseTrajectoryRequest(),
        watchCruiseListRequest(),
        watchTableStatsRequest(),
        // watchWorkerChannel(),
        watchCsvDownloadRequest(),
        watchDownloadTextAsCsv(),
        watchRefreshLogin()
    ])
}
  