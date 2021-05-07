import { put, takeLatest, all, call, delay, select, debounce } from 'redux-saga/effects';
// import { eventChannel } from 'redux-saga';
import Cookies from 'js-cookie';
import queryString from 'query-string';
import XLSX from 'xlsx';
// import worker from '../worker';

import * as userActions from './actions/user';
import * as catalogActions from './actions/catalog';
import * as interfaceActions from './actions/ui';
import * as visualizationActions from './actions/visualization';
import * as dataSubmissionActions from './actions/dataSubmission';

import * as userActionTypes from './actionTypes/user';
import * as catalogActionTypes from './actionTypes/catalog';
import * as visualizationActionTypes from './actionTypes/visualization';
import * as interfaceActionTypes from './actionTypes/ui';
import * as dataSubmissionActionTypes from './actionTypes/dataSubmission';
import * as communityActionTypes from './actionTypes/community';

import api from '../api';
import groupVariablesByDataset from '../Utility/Catalog/groupVariablesByDataset';
import groupDatasetsByMake from '../Utility/Catalog/groupDatasetsByMake';
import buildSearchOptionsFromVariablesList from '../Utility/Catalog/buildSearchOptionsFromVariablesList';
import buildSearchOptionsFromDatasetList from '../Utility/Catalog/buildSearchOptionsFromDatasetList';
import lastRowTimeSpaceDataFromChart from '../Utility/Visualization/lastRowTimeSpaceDataFromChart';

import states from '../Enums/asyncRequestStates';
import SPARSE_DATA_QUERY_MAX_SIZE from '../Enums/sparseDataQueryMaxSize';

function* userLogin(action) {
    yield put(userActions.userLoginRequestProcessing());
    let result = yield call(api.user.login, action.payload);
    
    if(result.ok){
        yield put(interfaceActions.hideLoginDialog());
        var userInfo = JSON.parse(Cookies.get('UserInfo'));
        yield put(userActions.userLoginRequestSuccess());
        yield put(userActions.storeInfo(userInfo));
        yield put(interfaceActions.snackbarOpen('Login was successful!'));
        yield put(userActions.cartGetAndStore());
        if(window.location.pathname === '/login') window.location.href = "/catalog";
    } else {
        yield put(userActions.userLoginRequestFailure());
        yield put(interfaceActions.snackbarOpen('Login failed.'));
    }
}

function* userLogout(){    
    let authInstance = yield window.gapi.auth2.getAuthInstance();
    yield authInstance.signOut();
    yield call(api.user.logout);
    yield put(userActions.destroyInfo());
    yield window.location.href = "/";
}

function* userRegistration(action){
    yield put(userActions.userRegistrationRequestProcessing());
    let result = yield call(api.user.register, action.payload);
    
    if(result.ok){
        yield put(interfaceActions.registrationNextActiveStep());
    } else {
        yield put(userActions.userRegistrationRequestFailure());
        yield put(interfaceActions.snackbarOpen('Registration failed. Please try again later.'))
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

function* googleLoginRequest(action){
    yield put(userActions.googleLoginRequestProcessing());
    let result = yield call(api.user.googleLoginRequest, action.payload.userIDToken);

    if(result.ok){
        yield put(interfaceActions.hideLoginDialog());
        var userInfo = JSON.parse(Cookies.get('UserInfo'));
        yield put(userActions.userLoginRequestSuccess());
        yield put(userActions.storeInfo(userInfo));
        yield put(userActions.cartGetAndStore());
        if(window.location.pathname === '/login') window.location.href = "/";
    } else {
        yield put(userActions.userLoginRequestFailure());
        yield put(interfaceActions.snackbarOpen('Login failed.'));
    }
}

function* catalogRetrieval(){
    yield put(interfaceActions.setLoadingMessage('Fetching Data'));
    let catalog = yield call(api.catalog.retrieve);
    
    if(!catalog) {
        yield put(catalogActions.retrievalRequestFailure());
    } else{
        yield put(catalogActions.retrievalRequestSuccess(catalog));
    }

    yield put(interfaceActions.setLoadingMessage(''));
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

    if(result.status === 401){
        yield put(userActions.refreshLogin());
    }
    
    if(!result.ok){
        yield put(userActions.keyRetrievalRequestFailure());
        yield put(interfaceActions.snackbarOpen('API Key Retrieval Failed'));
    } else {
        let response = yield result.json();
        yield put(userActions.keyRetrievalRequestSuccess(response.keys));
    }
}

function* keyCreation(action){
    yield put(userActions.keyCreationRequestProcessing());
    let result = yield call(api.user.keyCreation, action.payload.description);

    if(result.status === 401){
        yield put(userActions.refreshLogin());
        return;
    }
    
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
        if(result.status === 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen("An unexpected error occurred. Please reduce the size of your query and try again."));
        }
    } else {
        if(result.variableValues.length > 0){
            result.finalize();
            yield put(visualizationActions.handleGuestVisualization());
            yield put(interfaceActions.setLoadingMessage(''));
            yield put(visualizationActions.storedProcedureRequestSuccess());
            // yield put(interfaceActions.snackbarOpen(`${action.payload.subType} ${action.payload.parameters.fields} is ready`));
            yield put(visualizationActions.triggerShowCharts());
            yield put(visualizationActions.addChart({subType: action.payload.subType, data:result}));
            window.scrollTo(0,0);
           
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
        if(result.status === 401){
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
        cruiseList.forEach(cruise => cruise.Regions = cruise.Regions.split(','))
        yield put(visualizationActions.cruiseListRequestSuccess(cruiseList));
    }
}

function* tableStatsRequest(action){
    yield put(visualizationActions.tableStatsRequestProcessing());
    yield put(interfaceActions.setLoadingMessage('Fetching Dataset Information'));
    let result = yield call(api.visualization.getTableStats, action.payload.tableName);
    yield put(interfaceActions.setLoadingMessage(''));

    if(result.failed){
        if(result.status === 401){
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
    
    let dataResponse = yield call(api.visualization.csvDownload, action.payload.query);

    yield put(interfaceActions.setLoadingMessage(''))
    if(dataResponse.failed) {
        if(dataResponse.status === 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen('An error occurred. Please try again.'))
        }
    } else {
        if(dataResponse.length > 1) {
            yield put(visualizationActions.downloadTextAsCsv(dataResponse, action.payload.fileName));
        } else yield put(interfaceActions.snackbarOpen('No data found. Please expand query range.'))        
    }
}


function* csvFromVizRequest(action){
    yield put(interfaceActions.setLoadingMessage('Processing Data'));
    const csvData = yield action.payload.vizObject.generateCsv();
    let dataWB = XLSX.read(csvData, {type: 'string'});

    yield put(interfaceActions.setLoadingMessage('Fetching metadata'));

    const metadataQuery = `exec uspVariableMetadata '${action.payload.tableName}', '${action.payload.shortName}'`;
    let metadataResponse = yield call(api.visualization.csvDownload, metadataQuery);
    let metadataWB = XLSX.read(metadataResponse, {type: 'string'});

    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataWB.Sheets.Sheet1, 'Data');
    XLSX.utils.book_append_sheet(workbook, metadataWB.Sheets.Sheet1, 'Variable Metadata');
    XLSX.writeFile(workbook, `${action.payload.longName}.xlsx`);
    


    yield put(interfaceActions.setLoadingMessage(''));

    

    if(metadataResponse.failed) yield put(interfaceActions.snackbarOpen('Failed to download variable metadata'));

    // yield put(visualizationActions.downloadTextAsCsv(csvData, action.payload.longName));
    // yield put(visualizationActions.downloadTextAsCsv(metadataResponse, action.payload.longName + '_Metadata'));
}

function* downloadTextAsCsv(action){
    yield put(interfaceActions.setLoadingMessage('Processing Data'))
    let csv = action.payload.text;
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${action.payload.fileName}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // URL.revokeObjectURL(url); // TODO test this
    yield put(interfaceActions.setLoadingMessage(''));
}

function* refreshLogin(){
    yield call(api.user.logout);
    yield put(userActions.destroyInfo());
    yield put(interfaceActions.showLoginDialog());
    // yield put(interfaceActions.snackbarOpen("Your session has expired. Please log in again."));
}

function* updateUserInfoRequest(action){
    yield put(interfaceActions.setLoadingMessage('Updating your information'));

    let result = yield call(api.user.updateUserInfo, action.payload);

    if(result.failed){
        yield put(interfaceActions.setLoadingMessage(''));
        if(result.status === 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen("An error occurred. Please try again."));
        }
    } else {
        yield put(userActions.storeInfo(JSON.parse(Cookies.get('UserInfo'))));
        yield put(interfaceActions.snackbarOpen("Your information was updated"));
    }

    yield put(interfaceActions.setLoadingMessage(''));
}

function* initializeGoogleAuth(){
    try {
        var authInstance = yield window.gapi.auth2.getAuthInstance();
    }

    catch(e) {
        yield delay(100);
        yield put(userActions.initializeGoogleAuth());
        return;
    }

    let user = yield authInstance.currentUser.get();
    let authResponse = yield user.getAuthResponse(true);
    if(authResponse) yield put(userActions.googleLoginRequestSend(authResponse.id_token));
}

function* recoverPasswordRequest(action){
    yield call(api.user.recoverPassword, action.payload.email);
}

function* choosePasswordRequest(action){
    yield put(interfaceActions.setLoadingMessage('Confirming change'));
    let result = yield call(api.user.choosePassword, action.payload);
    yield put(interfaceActions.setLoadingMessage(''));
    if(result.ok){
        yield put(userActions.choosePasswordRequestSuccess());
    } else {
        yield put(userActions.choosePasswordRequestFailure());
    }
}

function* contactUsRequest(action){
    yield put(interfaceActions.setLoadingMessage('Sending'));
    let result = yield call(api.user.contactUs, action.payload);
    yield put(interfaceActions.setLoadingMessage(''));
    if(result.ok){
        yield put(interfaceActions.snackbarOpen('Your message was successfully sent!'));
    } else {
        yield put(interfaceActions.snackbarOpen('Message failed. Please try again or contact simonscmap@uw.edu'));
    }
}

function* changePasswordRequest(action){
    yield put(interfaceActions.setLoadingMessage('Confirming Changes'));
    let result = yield call(api.user.changePassword, action.payload);
    yield put(interfaceActions.setLoadingMessage(''));
    
    if(result.ok){
        yield put(interfaceActions.hideChangePasswordDialog());
        yield put(interfaceActions.snackbarOpen('Your password has been updated.'));
    } else if(result.status === 401) {
        yield put(interfaceActions.snackbarOpen('The current password you entered is not correct.'));
    } else {
        yield put(interfaceActions.snackbarOpen('An error occurred with your request.'));
    }
}

function* changeEmailRequest(action){
    yield put(interfaceActions.setLoadingMessage('Confirming Changes'));
    let result = yield call(api.user.changeEmail, action.payload);

    if(result.ok){
        yield put(userActions.storeInfo(JSON.parse(Cookies.get('UserInfo'))));
        yield put(interfaceActions.hideChangeEmailDialog());
        yield put(interfaceActions.snackbarOpen('Your email address has been updated.'));
    } else if(result.status === 401) {
        yield put(interfaceActions.snackbarOpen('The current password you entered is not correct.'));
    } else if(result.status === 409) {
        yield put(interfaceActions.snackbarOpen('That email address is already in use.'));
    } else {
        yield put(interfaceActions.snackbarOpen('We were not able to update your email address.'));
    }

    yield put(interfaceActions.setLoadingMessage(''));
}

function* copyTextToClipboard(action) {
    var textArea = document.createElement("textarea");
    textArea.value = action.payload.text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    textArea.remove();
    yield put(interfaceActions.snackbarOpen('Copied to Clipboard'));
}

function* retrieveSubmissionsByUser() {
    yield put(interfaceActions.setLoadingMessage('Fetching submission information'));
    let response = yield call(api.dataSubmission.retrieveSubmissionByUser);
    if(response.ok){
        let jsonResponse = yield response.json();
        yield put(dataSubmissionActions.storeSubmissions(jsonResponse));
    } 
    
    else if (response.status === 401) {
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.snackbarOpen('Unable to retrieve submissions'));
    }
    yield put(interfaceActions.setLoadingMessage(''));
}

function* retrieveAllSubmissions() {
    let response = yield call(api.dataSubmission.retrieveAllSubmissions);
    if(response.ok){
        let jsonResponse = yield response.json();

        if(jsonResponse.length < 1){
            yield put(interfaceActions.snackbarOpen('No submissions found'));
        }

        else {
            yield put(dataSubmissionActions.storeSubmissions(jsonResponse));
        }
    } 
    
    else if (response.status === 401) {
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.snackbarOpen('Unable to retrieve submissions'));
    }
}

function* addSubmissionComment(action) {
    let response = yield call(api.dataSubmission.addSubmissionComment, action.payload);

    if(response.ok){
        yield put(dataSubmissionActions.retrieveSubmissionCommentHistory(action.payload.submissionID));
        if(action.payload.source === 'admin') yield put(dataSubmissionActions.retrieveAllSubmissions());
        else yield put(dataSubmissionActions.retrieveDataSubmissionsByUser());
        
    } 
    
    else if (response.status === 401) {
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to submit comment. Please try again.'));
    }
}

function* retrieveSubmissionCommentHistory(action) {
    yield put(dataSubmissionActions.setSubmissionCommentHistoryRetrievalState(states.inProgress));

    let response = yield call(api.dataSubmission.retrieveCommentHistory, action.payload);

    if(response.ok){
        let jsonResponse = yield response.json();        

        if(jsonResponse.length < 1){}

        else {
            let payload = {
                comments: jsonResponse,
                submissionID: action.payload.submissionID
            }
            yield put(dataSubmissionActions.storeSubmissionComments(payload));
        }
    } 
    
    else if (response.status === 401) {
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to retrieve comment history.'));
    }

    yield put(dataSubmissionActions.setSubmissionCommentHistoryRetrievalState(states.succeeded));
}

function* uploadSubmission(action) {
    yield put(interfaceActions.setLoadingMessage('Uploading Workbook'));
    let { file, datasetName, dataSource, datasetLongName } = action.payload;
    let fileSize = file.size;

    let chunkSize = 5 * 1024 * 1024;
    let offset = 0;

    let retries = 0;
    let sessionID;

    let beginSessionFormData = new FormData();
    beginSessionFormData.append('datasetName', datasetName);
    
    while(retries < 3 && !sessionID){
        let beginSessionResponse = yield call(api.dataSubmission.beginUploadSession, beginSessionFormData);

        if(beginSessionResponse.ok){
            let jsonResponse = yield beginSessionResponse.json();
            sessionID = jsonResponse.sessionID;
        }

        else {
            let message = yield beginSessionResponse.text();
            if(message === 'wrongUser'){
                yield put(dataSubmissionActions.setUploadState(states.failed));
                yield put(interfaceActions.setLoadingMessage(''));
                return;
            }

            else {
                retries ++;
                yield delay(2000);
            }
        }
    }

    if(!sessionID){
        yield put(interfaceActions.snackbarOpen('Failed to begin upload session'));
        yield put(interfaceActions.setLoadingMessage(''));
        return;
    }

    retries = 0;

    var currentPartSucceeded = false;

    while(offset < fileSize){
        currentPartSucceeded = false;

        while(currentPartSucceeded === false && retries < 3){
            let part = file.slice(offset, offset + chunkSize);

            let formData = new FormData();
            formData.append('part', part);
            formData.append('offset', offset);
            formData.append('sessionID', sessionID);

            let uploadPartResponse = yield call(api.dataSubmission.uploadPart, formData);

            if(uploadPartResponse.ok){
                currentPartSucceeded = true;
            }

            else {
                retries ++;
                yield delay(2000);
            }
        }
        
        if(currentPartSucceeded === false){
            yield put(interfaceActions.snackbarOpen('Upload failed'));
            yield put(interfaceActions.setLoadingMessage(''));
            return;
        }

        else {
            offset += chunkSize;
        }
    }

    retries = 0;

    let formData = new FormData();
    formData.append('fileName', datasetName);
    formData.append('offset', fileSize);
    formData.append('sessionID', sessionID);
    formData.append('dataSource', dataSource);
    formData.append('datasetLongName', datasetLongName);

    var commitSucceeded = false;

    while(retries < 4 && commitSucceeded === false) {
        let commitFileResponse = yield call(api.dataSubmission.commitUpload, formData);        

        if(commitFileResponse.ok){
            commitSucceeded = true;
        }

        else {
            retries ++;
            yield delay(2000);
        }
    }

    if(commitSucceeded === true){
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(dataSubmissionActions.setUploadState(states.succeeded));
    }

    else {
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(interfaceActions.snackbarOpen('Failed to upload'));
        return;
    }
}

function* setDataSubmissionPhase(action) {
    let formData = {
        phaseID: action.payload.phaseID,
        submissionID: action.payload.submissionID
    };

    let response = yield call(api.dataSubmission.setPhase, formData);

    if(response.ok){
        yield put(dataSubmissionActions.retrieveAllSubmissions());
    } 
    
    else if (response.status === 401) {
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to retrieve submissions'));
    }
}

function* retrieveMostRecentFile(action) {
    const { submissionID } = action.payload;

    yield put(interfaceActions.setLoadingMessage('Fetching the latest submission'));

    let linkResponse = yield call(api.dataSubmission.retrieveMostRecentFile, submissionID);

    if(linkResponse.ok){
        let jsonResponse = yield linkResponse.json();

        let { link, dataset } = jsonResponse;

        let getFileResponse = yield call(api.dataSubmission.getFileFromLink, link);
        let blob = yield getFileResponse.blob();
        blob.name = `${dataset}.xlsx`;

        yield put(dataSubmissionActions.checkSubmissionOptionsAndStoreFile(blob));
    }

    else if (linkResponse.status === 401) {
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(interfaceActions.snackbarOpen('Failed to retrieve submissions'));
    }    
}

function* checkSubmissionOptionsAndStoreFile(action) {
    let storedOptions = yield select((state) => state.dataSubmissionSelectOptions);
    let options;

    if(storedOptions){
        options = storedOptions;
    }

    else {
        let result = yield call(api.catalog.submissionOptions);
        if(!result.ok){
            return put(interfaceActions.snackbarOpen('Unable to retrieve validation options'));
        }

        else {
            options = yield result.json();
            let tempRemoveInSituOptions = {
                ...options,
                Sensor: options.Sensor.filter(item => item !== 'In-Situ')
            }
            yield put(dataSubmissionActions.dataSubmissionSelectOptionsStore(tempRemoveInSituOptions));
        }
    }
    
    yield put(dataSubmissionActions.storeSubmissionFile(action.payload.file));
}

function* downloadMostRecentFile(action) {
    const { submissionID } = action.payload;

    yield put(interfaceActions.setLoadingMessage('Downloading the latest submission'));

    let linkResponse = yield call(api.dataSubmission.retrieveMostRecentFile, submissionID);

    if(linkResponse.ok){
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
        yield put(interfaceActions.setLoadingMessage(''));
    }

    else if (linkResponse.status === 401) {
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(userActions.refreshLogin());
    }

    else {
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(interfaceActions.snackbarOpen('Unable to download'));
    } 
}

function* keywordsFetch() {
    let keywordsFetchResponse = yield call(api.catalog.fetchKeywords);

    if(keywordsFetchResponse.ok){
        let jsonResponse = yield keywordsFetchResponse.json();
        yield put(catalogActions.keywordsStore(jsonResponse));
    }
}

function* searchOptionsFetch(){
    let result = yield call(api.catalog.submissionOptions);
    if(result.ok){
        let options = yield result.json();
        options.Temporal_Resolution.unshift('Any');
        options.Spatial_Resolution.unshift('Any');
        options.Data_Source.unshift('Any');
        options.Distributor.unshift('Any');
        options.Process_Level.unshift('Any');
        yield put(catalogActions.storeSubmissionOptions(options));
    }

    else {
        console.log('Failed to retrieve search options');
    }
}

// This saga is debounced in its watch function
function* searchResultsFetch(action){
    let result = yield call(api.catalog.searchResults, action.payload.queryString);

    if(result.ok){
        const storedOptions = yield select((state) => state.submissionOptions);
        const params = queryString.parse(action.payload.queryString);

        let results = yield result.json();
        let options = buildSearchOptionsFromDatasetList(results, storedOptions, params);
        yield put(catalogActions.searchResultsStore(results, options));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to retrieve search results. Please try again later.'));
    }
    yield put(catalogActions.searchResultsSetLoadingState(states.succeeded));
}

// function* vizSearchResultsFetch(action){
//     const { params } = action.payload;
    
//     const qString = '?' + queryString.stringify({
//         ...params, 
//         sensor: Array.from(params.sensor || new Set()),
//         make: Array.from(params.make || new Set()),
//         region: Array.from(params.region || new Set())
//     });

//     const searchResponse = yield call(api.visualization.variableSearch, qString);
//     const storedOptions = yield select((state) => state.submissionOptions);

//     if(searchResponse.ok){
//         const { counts, variables } = yield searchResponse.json();
//         let options = buildSearchOptionsFromVariablesList(variables, storedOptions, params);
//         let datasets = groupVariablesByDataset(variables);
//         let makes = groupDatasetsByMake(datasets);
//         yield put(visualizationActions.vizSearchResultsStoreAndUpdateOptions(makes, options, counts));
//         yield put(visualizationActions.vizSearchResultsSetLoadingState(states.succeeded));
//     }

//     else {
//         yield put(interfaceActions.snackbarOpen('Search failed. Please try again.'));
//     }
// }

function* datasetFullPageDataFetch(action) {
    yield put(catalogActions.datasetFullPageDataSetLoadingState(states.inProgress));
    let result = yield call(api.catalog.datasetFullPageDataFetch, action.payload.shortname);

    if(result.ok){
        let results = yield result.json();
        yield put(catalogActions.datasetFullPageDataStore(results));
        yield put(catalogActions.datasetFullPageDataSetLoadingState(states.succeeded));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to retrieve information. Please try again later.'));
        yield put(catalogActions.datasetFullPageDataSetLoadingState(states.succeeded));
    }
}

function* cruiseFullPageDataFetch(action) {
    yield put(catalogActions.cruiseFullPageDataSetLoadingState(states.inProgress));
    let result = yield call(api.catalog.cruiseFullPageDataFetch, action.payload.name);

    if(result.ok){
        let results = yield result.json();
        yield put(catalogActions.cruiseFullPageDataStore(results));
        yield put(catalogActions.cruiseFullPageDataSetLoadingState(states.succeeded));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Failed to retrieve information. Please try again later.'));
        yield put(catalogActions.datasetFullPageDataSetLoadingState(states.succeeded));
    }
}

function* cartPersistAddItem(action){
    let formData = {itemID: action.payload.datasetID};
    yield call(api.user.cartPersistAddItem, formData);
}

function* cartPersistRemoveItem(action){
    let formData = {itemID: action.payload.datasetID};
    yield call(api.user.cartPersistRemoveItem, formData);
}

function* cartPersistClear(){
    yield call(api.user.cartPersistClear);
}

function* cartGetAndStore(){
    let result = yield call(api.user.getCart);

    if(result.ok){
        let results = yield result.json();
        let formattedResults = results.reduce((acc, dataset) => {
            acc[dataset.Long_Name] = dataset;
            return acc;
        }, {});
        
        yield put(catalogActions.cartAddMultiple(formattedResults));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Unable to retrieve cart information'));
    }
}

function* vizSearchResultsFetch(action){
    const { params } = action.payload;
    
    const qString = '?' + queryString.stringify({
        ...params, 
        sensor: Array.from(params.sensor || new Set()),
        make: Array.from(params.make || new Set()),
        region: Array.from(params.region || new Set())
    });

    const searchResponse = yield call(api.visualization.variableSearch, qString);
    const storedOptions = yield select((state) => state.submissionOptions);
    const cart = yield select((state) => state.cart);

    if(searchResponse.ok){
        const { counts, variables } = yield searchResponse.json();
        let options = buildSearchOptionsFromVariablesList(variables, storedOptions, params);
        let datasets = groupVariablesByDataset(variables, cart);
        let makes = groupDatasetsByMake(datasets);
        yield put(visualizationActions.vizSearchResultsStoreAndUpdateOptions(makes, options, counts));
        yield put(visualizationActions.vizSearchResultsSetLoadingState(states.succeeded));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Search failed. Please try again.'));
    }
}

function* memberVariablesFetch(action){
    let response = yield call(api.visualization.memberVariablesFetch, action.payload.datasetID);

    if(response.ok){
        let variables = yield response.json();
        yield put(visualizationActions.memberVariablesStore(variables));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Unable to get variables at this time'));
    }
}

function* autocompleteVariableNamesFetch(action) {
    if(!action.payload.terms) {
        yield put(visualizationActions.variableNameAutocompleteStore([]));
        return;
    }        

    let response = yield call(api.visualization.autocompleteVariableNamesFetch, encodeURIComponent(action.payload.terms));

    if(response.ok){
        let jsonResponse = yield response.json();
        yield put(visualizationActions.variableNameAutocompleteStore(jsonResponse));
    }
}

// variable stats dialog
function* variableFetch(action) {
    if(action.payload.id === null){
        yield put(visualizationActions.variableStore(null));
    }

    else {
        yield put(visualizationActions.variableFetchSetLoadingState(states.inProgress));
    
        let response = yield call(api.visualization.variableFetch, action.payload.id);
    
        if(response.ok){
            let variableDetails = yield response.json();
            yield put(visualizationActions.variableStore(variableDetails));
        }
    
        else {
            yield put(interfaceActions.snackbarOpen('Unable to fetch variable details. Please try again later'));
        }
    }
}

function* datasetSummaryFetch(action) {
    if(action.payload.id === null){
        yield put(visualizationActions.datasetSummaryStore(null));
    }

    else {
        let response = yield call(api.visualization.datasetSummaryFetch, action.payload.id);

        if(response.ok){
            let datasetSummary = yield response.json();
            yield put(visualizationActions.datasetSummaryStore(datasetSummary))
        }

        else {
            yield put(interfaceActions.snackbarOpen('Unable to fetch dataset summary. Please try again later'));
        }
    }
}

function* vizPageDataTargetSetAndFetchDetails(action) {
    yield put(visualizationActions.vizPageDataTargetSet(action.payload.vizPageDataTarget));
    if(action.payload.vizPageDataTarget === null) return;
    
    let response = yield call(api.visualization.variableFetch, action.payload.vizPageDataTarget.ID);
    
    if(response.ok){
        let variableDetails = yield response.json();
        yield put(visualizationActions.vizPageDataTargetDetailsStore(variableDetails));
    }

    else {
        yield put(interfaceActions.snackbarOpen('Unable to fetch variable details. Please try again later'));
    }
}

function* dataSubmissionDelete(action){
    let result = yield call(api.dataSubmission.deleteSubmission, action.payload.submission.Submission_ID);
    
    if(result.ok){
        yield put(dataSubmissionActions.retrieveAllSubmissions());
        yield put(interfaceActions.snackbarOpen(`Successfully deleted ${action.payload.submission.Dataset}`));
    }

    else {
        yield put(interfaceActions.snackbarOpen(`Failed to delete ${action.payload.submission.Dataset}`))
    }
}

function* sparseDataQuerySend(action) {
    const { parameters, subType, metadata } = action.payload;

    yield put(interfaceActions.setLoadingMessage('Fetching Data'));

    let result = yield call(api.visualization.sparseDataQuerysend, action.payload);
    yield delay(50);
    yield put(interfaceActions.setLoadingMessage('Processing Data'));
    yield delay(70);
    
    // Result will be an object containing variable values and describing data shape
    if(result.failed){
        yield put(interfaceActions.setLoadingMessage(''));
        yield put(visualizationActions.storedProcedureRequestFailure());
        if(result.status === 401){
            yield put(userActions.refreshLogin());
        } else {
            yield put(interfaceActions.snackbarOpen("An unexpected error occurred. Please reduce the size of your query and try again."));
        }
    } else {
        if(result.variableValues.length > 0){
            result.finalize();
            yield put(visualizationActions.handleGuestVisualization());
            yield put(interfaceActions.setLoadingMessage(''));
            yield put(visualizationActions.storedProcedureRequestSuccess());
            // yield put(interfaceActions.snackbarOpen(`${action.payload.subType} ${action.payload.parameters.fields} is ready`));
            yield put(visualizationActions.triggerShowCharts());
            yield put(visualizationActions.addChart({subType: action.payload.subType, data:result}));
            if(result.variableValues.length >= SPARSE_DATA_QUERY_MAX_SIZE) yield put(visualizationActions.sparseDataMaxSizeNotificationUpdate(lastRowTimeSpaceDataFromChart(result)));
            window.scrollTo(0,0);
           
        } else {
            yield put(interfaceActions.setLoadingMessage(''));
            yield put(interfaceActions.snackbarOpen(`No data found for ${action.payload.parameters.fields} in the requested ranges. Try selecting a different date or depth range.`));
        }
    }
}

function* errorReportSend(action){
    yield call(api.community.errorReport, action.payload);
}

function* dataSubmissionSelectOptionsFetch(action){
    
}

function* handleGuestVisualization(action){
    // Checks for user. Increments guest plot count. Shows dialog when limit reached
    var userInfo = Cookies.get('UserInfo');
    if(userInfo) return;

    let guestPlotCount = parseInt(Cookies.get('guestPlotCount'));
    let expires = new Date();
    expires.setHours(24, 0, 0, 0);
    Cookies.set('guestPlotCount', guestPlotCount ? guestPlotCount + 1 : 1, {expires});

    if(guestPlotCount >= 9){
        yield put(visualizationActions.guestPlotLimitNotificationSetIsVisible(true));
    }
}

function* guestTokenRequestSend(action){
    let userIsGuest = yield select((state) => state.userIsGuest);

    if(userIsGuest){
        yield put(visualizationActions.guestPlotLimitNotificationSetIsVisible(false));
    }

    else {
        let expires = new Date();
        expires.setHours(24, 0, 0, 0);
    
        let result = yield call(api.user.getGuestToken, expires.valueOf());
        
        if(result.status === 200){
            yield put(interfaceActions.hideLoginDialog());
            yield put(userActions.userIsGuestSet(true));
            yield put(visualizationActions.guestPlotLimitNotificationSetIsVisible(false));
        }
    
        else {
            yield put(interfaceActions.snackbarOpen('Guest login is currently unavailable. Please try again later, log in, or register a new account. '));
        }
    }

}

function* ingestCookies(){
    let state = {};

    if(Cookies.get('guestToken')) state['userIsGuest'] = true;
    yield put(userActions.updateStateFromCookies(state));
}

function* watchUserLogin() {
    yield takeLatest(userActionTypes.LOGIN_REQUEST_SEND, userLogin);
}

function* watchUserRegistration() {
    yield takeLatest(userActionTypes.REGISTRATION_REQUEST_SEND, userRegistration);
}

function* watchUserValidation(){
    yield takeLatest(userActionTypes.VALIDATION_REQUEST_SEND, userValidation);
}

function* watchUserLogout() {
    yield takeLatest(userActionTypes.LOG_OUT, userLogout)
}

function* watchGoogleLoginRequest(){
    yield takeLatest(userActionTypes.GOOGLE_LOGIN_REQUEST_SEND, googleLoginRequest);
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

function* watchUpdateUserInfoRequest(){
    yield takeLatest(userActionTypes.UPDATE_USER_INFO_REQUEST_SEND, updateUserInfoRequest);
}

function* watchInitializeGoogleAuth(){
    yield takeLatest(userActionTypes.INITIALIZE_GOOGLE_AUTH, initializeGoogleAuth);
}

function* watchRecoverPasswordRequest(){
    yield takeLatest(userActionTypes.RECOVER_PASSWORD_REQUEST_SEND, recoverPasswordRequest);
}

function* watchChoosePasswordRequest(){
    yield takeLatest(userActionTypes.CHOOSE_PASSWORD_REQUEST_SEND, choosePasswordRequest)
}

function* watchContactUs(){
    yield takeLatest(userActionTypes.CONTACT_US_REQUEST_SEND, contactUsRequest);
}

function* watchChangePasswordRequest(){
    yield takeLatest(userActionTypes.CHANGE_PASSWORD_REQUEST_SEND, changePasswordRequest);
}

function* watchChangeEmailRequest(){
    yield takeLatest(userActionTypes.CHANGE_EMAIL_REQUEST_SEND, changeEmailRequest);
}

function* watchCsvFromVizRequest(){
    yield takeLatest(visualizationActionTypes.CSV_FROM_VIZ_REQUEST_SEND, csvFromVizRequest);
}

function* watchCopyTextToClipboard(){
    yield takeLatest(interfaceActionTypes.COPY_TEXT_TO_CLIPBOARD, copyTextToClipboard);
}

function* watchRetrieveSubmissionsByUser() {
    yield takeLatest(dataSubmissionActionTypes.RETRIEVE_SUBMISSIONS_BY_USER, retrieveSubmissionsByUser);
}

function* watchRetrieveAllSubmissions() {
    yield takeLatest(dataSubmissionActionTypes.RETRIEVE_ALL_SUBMISSIONS, retrieveAllSubmissions);
}

function* watchAddSubmissionComment() {
    yield takeLatest(dataSubmissionActionTypes.ADD_SUBMISSION_COMMENT, addSubmissionComment);
}

function* watchRetrieveSubmissionCommentHistory() {
    yield takeLatest(dataSubmissionActionTypes.RETRIEVE_SUBMISSION_COMMENT_HISTORY, retrieveSubmissionCommentHistory);
}

function* watchUploadSubmission() {
    yield takeLatest(dataSubmissionActionTypes.UPLOAD_SUBMISSION, uploadSubmission);
}

function* watchSetDataSubmissionPhase() {
    yield takeLatest(dataSubmissionActionTypes.SET_SUBMISSION_PHASE, setDataSubmissionPhase);
}

function* watchRetrieveMostRecentFile() {
    yield takeLatest(dataSubmissionActionTypes.RETRIEVE_MOST_RECENT_FILE, retrieveMostRecentFile);
}

function* watchCheckSubmissionOptionsAndStoreFile() {
    yield takeLatest(dataSubmissionActionTypes.CHECK_SUBMISSION_OPTIONS_AND_STORE_FILE, checkSubmissionOptionsAndStoreFile);
}

function* watchDownloadMostRecentFile(){
    yield takeLatest(dataSubmissionActionTypes.DOWNLOAD_MOST_RECENT_FILE, downloadMostRecentFile);
}

function* watchKeywordsFetch(){
    yield takeLatest(catalogActionTypes.KEYWORDS_FETCH, keywordsFetch);
}

function* watchSearchOptionsFetch(){
    yield takeLatest(catalogActionTypes.SEARCH_OPTIONS_FETCH, searchOptionsFetch);
}

function* watchSearchResultsFetch() {
    yield debounce(450, catalogActionTypes.SEARCH_RESULTS_FETCH, searchResultsFetch);
}

function* watchDatasetFullPageDataFetch(){
    yield takeLatest(catalogActionTypes.DATASET_FULL_PAGE_DATA_FETCH, datasetFullPageDataFetch);
}

function* watchCruiseFullPageDataFetch(){
    yield takeLatest(catalogActionTypes.CRUISE_FULL_PAGE_DATA_FETCH, cruiseFullPageDataFetch);
}

function* watchCartPersistAddItem(){
    yield takeLatest(userActionTypes.CART_PERSIST_ADD_ITEM, cartPersistAddItem)
}

function* watchCartPersistRemoveItem(){
    yield takeLatest(userActionTypes.CART_PERSIST_REMOVE_ITEM, cartPersistRemoveItem)
}

function* watchCartPersistClear(){
    yield takeLatest(userActionTypes.CART_PERSIST_CLEAR, cartPersistClear);
}

function* watchCartGetAndStore(){
    yield takeLatest(userActionTypes.CART_GET_AND_STORE, cartGetAndStore);
}

function* watchVizSearchResultsFetch(){
    yield debounce(450, visualizationActionTypes.VIZ_SEARCH_RESULTS_FETCH, vizSearchResultsFetch);
}

function* watchMemberVariablesFetch(){
    yield takeLatest(visualizationActionTypes.MEMBER_VARIABLES_FETCH, memberVariablesFetch);
}

function* watchAutocompleteVariableNamesFetch() {
    yield debounce(300, visualizationActionTypes.VARIABLE_NAME_AUTOCOMPLETE_FETCH, autocompleteVariableNamesFetch);
}

function* watchVariableFetch(){
    yield takeLatest(visualizationActionTypes.VARIABLE_FETCH, variableFetch);
}

function* watchDatasetSummaryFetch() {
    yield takeLatest(visualizationActionTypes.DATASET_SUMMARY_FETCH, datasetSummaryFetch);
}

function* watchVizPageDataTargetSetAndFetchDetails() {
    yield takeLatest(visualizationActionTypes.VIZ_PAGE_DATA_TARGET_SET_AND_FETCH_DETAILS, vizPageDataTargetSetAndFetchDetails);
}

function* watchDataSubmissionSelectOptionsFetch(){
    yield takeLatest(dataSubmissionActionTypes.DATA_SUBMISSION_SELECT_OPTIONS_FETCH, dataSubmissionSelectOptionsFetch);
}

function* watchDataSubmissionDelete(){
    yield takeLatest(dataSubmissionActionTypes.DATA_SUBMISSION_DELETE, dataSubmissionDelete);
}

function* watchSparseDataQuerySend() {
    yield takeLatest(visualizationActionTypes.SPARSE_DATA_QUERY_SEND, sparseDataQuerySend);
}

function* watchErrorReportSend(){
    yield takeLatest(communityActionTypes.ERROR_REPORT_SEND, errorReportSend);
}

function* watchHandleGuestVisualization(){
    yield takeLatest(visualizationActionTypes.HANDLE_GUEST_VISUALIZATION, handleGuestVisualization);
}

function* watchGuestTokenRequestSend(){
    yield takeLatest(userActionTypes.GUEST_TOKEN_REQUEST_SEND, guestTokenRequestSend);
}

function* watchIngestCookies(){
    yield takeLatest(userActionTypes.INGEST_COOKIES, ingestCookies);
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
        watchGoogleLoginRequest(),
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
        watchRefreshLogin(),
        watchUpdateUserInfoRequest(),
        watchInitializeGoogleAuth(),
        watchRecoverPasswordRequest(),
        watchChoosePasswordRequest(),
        watchContactUs(),
        watchChangePasswordRequest(),
        watchChangeEmailRequest(),
        watchCsvFromVizRequest(),
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
        watchDatasetFullPageDataFetch(),
        watchCruiseFullPageDataFetch(),
        watchCartPersistAddItem(),
        watchCartPersistRemoveItem(),
        watchCartPersistClear(),
        watchCartGetAndStore(),
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
        watchIngestCookies()
    ]);
}