import CSVParser from 'csv-parse';
import queryString from 'query-string';

import { apiUrl } from './config';
import SpaceTimeData from './Classes/SpaceTimeData';

import storedProcedures from './Enums/storedProcedures';
import TimeSeriesData from './Classes/TimeSeriesData';
import DepthProfileData from './Classes/DepthProfileData';
import SectionMapData from './Classes/SectionMapData';
import SparseData from './Classes/SparseData';

import encoding from 'text-encoding';

import sparseDataQueryFromPayload from './Utility/Visualization/sparseDataQueryFromPayload';

const fetchOptions = {
    credentials: 'include'
}

const postOptions = {
    ...fetchOptions,
    method: 'POST',
    headers: {"Content-Type": "application/json"}
}

const storedProcedureParametersToUri = (parameters) => {
    return Object.keys(parameters).reduce(function (queryString, key, i) {
        return `${queryString}${i===0 ? '' : '&&'}${key}=${parameters[key]}`;
      }, '');
}

const api = {};
api.user = {};
api.dataRetrieval = {};
api.catalog = {};
api.visualization = {};
api.dataSubmission = {};
api.community = {};

api.user.login = (user) => {
    return fetch(apiUrl + '/user/signin', {
        ...postOptions,
        body: JSON.stringify(user),
    });
}

api.user.logout = () => {
    return fetch(apiUrl + '/user/signout', fetchOptions);
}

api.user.register = (user) => {
    return fetch(apiUrl + '/user/signup', {
        ...postOptions,
        body: JSON.stringify(user),
    })
}

api.user.validate = (user) => {
    return fetch(apiUrl + '/user/validate', {
        ...postOptions,
        body: JSON.stringify(user),
    })
}

api.user.googleLoginRequest = async(userIDToken) => {
    let response = await fetch(apiUrl + '/user/googleauth', {
        ...postOptions,
        body: JSON.stringify({userIDToken}),
    })

    return response;
}

api.user.contactUs = async(payload) => {
    return await fetch(apiUrl + '/api/user/contactus', {
        ...postOptions,
        body: JSON.stringify(payload)
    })
}

api.user.changePassword = async(payload) => {
    return await fetch(apiUrl + '/api/user/changepassword', {
        ...postOptions,
        body: JSON.stringify(payload)
    })
}

api.user.changeEmail = async(payload) => {
    return await fetch(apiUrl + '/api/user/changeemail', {
        ...postOptions,
        body: JSON.stringify(payload)
    })
}

api.catalog.retrieve = async() => {

    const decoder = new encoding.TextDecoder();
    let catalog = [];

    let csvParser = CSVParser({columns:true});

    csvParser.on('readable', function(){
        let record
        while (record = csvParser.read()) {
            catalog.push(record)
        }
    })

    let response = await fetch(apiUrl + '/api/catalog', fetchOptions);

    if(!response.ok) return false;

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            csvParser.write(decoder.decode(chunk.value));
        };
    }
    return catalog;
}

api.catalog.datasets = async() => {
    const decoder = new encoding.TextDecoder();
    let datasets = {};

    let csvParser = CSVParser({columns:true});

    csvParser.on('readable', function(){
        let record
        while (record = csvParser.read()) {
            datasets[record.Dataset_Long_Name.trim()] = record;
        }
    })

    let response = await fetch(apiUrl + '/api/catalog/datasets', fetchOptions);

    if(!response.ok) return false;

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            csvParser.write(decoder.decode(chunk.value));
        };
    }
    return datasets;
}

api.catalog.submissionOptions = async() => {
    return await fetch(apiUrl + '/api/catalog/submissionoptions');
}

api.catalog.searchResults = async(queryString) => {
    return await fetch(apiUrl + '/api/catalog/searchcatalog' + queryString, fetchOptions);
}

api.user.keyRetrieval = async() => {
    return await fetch(apiUrl + '/user/retrieveapikeys', fetchOptions);
}

api.user.keyCreation = async(description) => {
    return await fetch(apiUrl + `/user/generateapikey?description=${description.trim()}`, fetchOptions);
}

api.user.updateUserInfo = async(userInfo) => {
    return await fetch(apiUrl + '/api/user/updateinfo', {
        ...postOptions,
        body: JSON.stringify(userInfo),
    });
}

api.catalog.fetchKeywords = async() => {
    return await fetch(apiUrl + '/api/catalog/keywords');
}

api.catalog.datasetFullPageDataFetch = async(shortname) => {
    return await fetch(apiUrl + `/api/catalog/datasetfullpage?shortname=${shortname}`, fetchOptions);
}

api.catalog.cruiseFullPageDataFetch = async(name) => {
    return await fetch(apiUrl + `/api/catalog/cruisefullpage?name=${name}`, fetchOptions);
}

api.catalog.cruiseSearch = async(qString) => {
    return await fetch(apiUrl + `/api/catalog/searchcruises` + qString, fetchOptions)
}

api.user.recoverPassword = async(email) => {
    fetch(apiUrl + '/api/user/forgotpassword', {
        ...postOptions,
        body: JSON.stringify({email})
    })
}

api.user.choosePassword = async({password, token}) => {
    return await fetch(apiUrl + '/api/user/choosepassword', {
        ...postOptions,
        body: JSON.stringify({password, token})
    })
}

api.visualization.storedProcedureRequest = async(payload) => {
    const decoder = new encoding.TextDecoder();
    var vizData;

    switch(payload.parameters.spName) {
        case storedProcedures.spaceTime:
            if(payload.subType === 'Sparse') vizData = new SparseData(payload);
            else vizData = new SpaceTimeData(payload);
            break;

        case storedProcedures.timeSeries:
            vizData = new TimeSeriesData(payload);
            break;

        case storedProcedures.depthProfile:
            vizData = new DepthProfileData(payload);
            break;

        case storedProcedures.sectionMap:
            vizData = new SectionMapData(payload);
            break;

        default:
            console.log('Unknown sproc name');
    }
    
    let response = await fetch(apiUrl + '/api/data/sp?' + storedProcedureParametersToUri(payload.parameters), fetchOptions);

    if(!response.ok) return {failed: true, status: response.status};

    let csvParser = CSVParser({from: 2});

    csvParser.on('readable', function(){
        let record;
        while (record = csvParser.read()) {
            vizData.add(record);
        }
    })

    csvParser.on('error', (e) => {
        console.log(e);
    })

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            csvParser.write(decoder.decode(chunk.value));
        };
    }

    return vizData;
}

api.visualization.sparseDataQuerysend = async(payload) => {
    const { parameters, metadata } = payload;

    const decoder = new encoding.TextDecoder();
    var vizData;

    // build the query
    let query = sparseDataQueryFromPayload(payload);
    
    switch(parameters.spName) {
        case storedProcedures.spaceTime:
            if(payload.subType === 'Sparse') vizData = new SparseData(payload);
            else vizData = new SpaceTimeData(payload);
            break;

        default:
            console.log('Unknown sproc name');
    }

    // let response = await fetch(apiUrl + '/api/data/sp?' + storedProcedureParametersToUri(payload.parameters), fetchOptions);
    let response = await fetch(apiUrl + '/api/data/query?query=' + encodeURI(query), fetchOptions);

    if(!response.ok) return {failed: true, status: response.status};

    let csvParser = CSVParser({from: 2});

    csvParser.on('readable', function(){
        let record;
        while (record = csvParser.read()) {
            vizData.add(record);
        }
    })

    csvParser.on('error', (e) => {
        console.log(e);
    })

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            csvParser.write(decoder.decode(chunk.value));
        };
    }
    
    return vizData;
}


api.visualization.getTableStats = async(tableName) => {
    let response = await fetch(apiUrl + '/dataretrieval/tablestats?table=' + tableName, fetchOptions);
    if(!response.ok) return {failed: true, status: response.status};
    return await response.json();
}

api.visualization.cruiseTrajectoryRequest = async(payload) => {
    const decoder = new encoding.TextDecoder();
    let trajectory = {lats: [], lons: []};

    let response = await fetch(apiUrl + '/api/data/cruisetrajectory?' + `id=${payload.id}`, fetchOptions);

    if(!response.ok) return {failed: true, status: response.status};

    let csvParser = CSVParser({from: 2});

    csvParser.on('readable', function(){
        let record;
        while (record = csvParser.read()) {
            trajectory.lats.push(parseFloat(record[1]));
            trajectory.lons.push(parseFloat(record[2]));
        }
    })

    let body = response.body;
    let reader = body.getReader();
    let readerIsDone = false;

    while(!readerIsDone){
        let chunk = await reader.read();
        if(chunk.done) {
            readerIsDone = true;
        }
        else {
            csvParser.write(decoder.decode(chunk.value));
        };
    }

    return trajectory;
}

api.visualization.cruiseList = async() => {
    let response = await fetch(apiUrl + '/api/data/cruiselist', fetchOptions);

    if(response.ok){
        return await response.json();
    } else return false;   
}

api.visualization.csvDownload = async(query) => {
    if(!query) return null;
    let response = await fetch(apiUrl + `/api/data/query?query=${query}`, fetchOptions);
    if(response.ok) return await response.text();
    else return {failed: true, status: response.status}
}

api.visualization.memberVariablesFetch = async(datasetID) => {
    return await fetch(apiUrl + `/api/catalog/membervariables?datasetID=${datasetID}`);
}

api.visualization.autocompleteVariableNamesFetch = async(terms) => {
    return await fetch(apiUrl + `/api/catalog/autocompletevariablesnames?searchTerms=${terms}`);
}

api.visualization.variableSearch = async(qString) => {
    return await fetch(apiUrl + `/api/catalog/variablesearch${qString}`, fetchOptions);
}

api.visualization.variableFetch = async(id) => {
    return await fetch(apiUrl + `/api/catalog/variable?id=${id}`, fetchOptions);
}

api.visualization.datasetSummaryFetch = async(id) => {
    return await fetch(apiUrl + `/api/catalog/datasetsummary?id=${id}`, fetchOptions)
}

api.dataSubmission.retrieveSubmissionByUser = async() => {
    return await fetch(apiUrl + `/api/datasubmission/submissionsbyuser`, fetchOptions);
}

api.dataSubmission.retrieveAllSubmissions = async() => {
    return await fetch(apiUrl + `/api/datasubmission/submissions`, fetchOptions);
}

api.dataSubmission.addSubmissionComment = async(payload) => {
    return await fetch(apiUrl + '/api/datasubmission/addcomment', {
        ...postOptions,
        body: JSON.stringify(payload),
    });
}

api.dataSubmission.beginUploadSession = async(formData) => {
    return await fetch(apiUrl + '/api/datasubmission/beginuploadsession', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
}

api.dataSubmission.uploadPart = async(formData) => {
    return await fetch(apiUrl + '/api/datasubmission/uploadfilepart', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
}

api.dataSubmission.commitUpload = async(formData) => {
    return await fetch(apiUrl + '/api/datasubmission/commitupload', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });
}

api.dataSubmission.setPhase = async(formData) => {
    return await fetch(apiUrl + '/api/datasubmission/setphase', {
        ...postOptions,
        body: JSON.stringify(formData)
    });
}

api.dataSubmission.retrieveCommentHistory = async(payload) => {
    return await fetch(`${apiUrl}/api/datasubmission/commenthistory?submissionID=${payload.submissionID}`, fetchOptions);
};

api.dataSubmission.retrieveMostRecentFile = async(submissionID) => {
    return await fetch(`${apiUrl}/api/datasubmission/retrievemostrecentfile?submissionID=${submissionID}`, fetchOptions);
}

api.dataSubmission.getFileFromLink = async(link) => {
    return await fetch(link);
}

api.dataSubmission.deleteSubmission = async(submissionID) => {
    return await fetch(`${apiUrl}/api/datasubmission/deletesubmission?submissionID=${submissionID}`, fetchOptions);
}

api.user.cartPersistAddItem = async(formData) => {
    return await fetch(apiUrl + '/api/user/addcartitem', {
        ...postOptions,
        body: JSON.stringify(formData)
    });
}

api.user.cartPersistRemoveItem = async(formData) => {
    return await fetch(apiUrl + '/api/user/removecartitem', {
        ...postOptions,
        body: JSON.stringify(formData)
    });
}

api.user.cartPersistClear = async() => {
    return await fetch(`${apiUrl}/api/user/clearcart`, fetchOptions);
}

api.user.getCart = async() => {
    return await fetch(`${apiUrl}/api/user/getcart`, fetchOptions);
}

api.user.getGuestToken = async(expires) => {
    return await fetch(`${apiUrl}/api/user/getguesttoken?expires=${expires}`, {...fetchOptions});
}

api.community.errorReport = async(formData) => {
    return await fetch(apiUrl + '/api/community/errorreport', {
        ...postOptions,
        body: JSON.stringify(formData),
    });
}
export default api;