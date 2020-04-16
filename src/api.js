import CSVParser from 'csv-parse';

import { apiUrl } from './config';
import SpaceTimeData from './Classes/SpaceTimeData';

import storedProcedures from './Enums/storedProcedures';
import TimeSeriesData from './Classes/TimeSeriesData';
import DepthProfileData from './Classes/DepthProfileData';
import SectionMapData from './Classes/SectionMapData';
import SparseData from './Classes/SparseData';

import encoding from 'text-encoding';

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
    console.log(payload);
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

export default api;