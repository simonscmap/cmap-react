import CSVParser from 'csv-parse';

import { apiUrl } from './config';
import SpaceTimeData from './Classes/SpaceTimeData';

import storedProcedures from './Enums/storedProcedures';
import TimeSeriesData from './Classes/TimeSeriesData';
import DepthProfileData from './Classes/DepthProfileData';
import SectionMapData from './Classes/SectionMapData';
import SparseData from './Classes/SparseData';

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

api.catalog.retrieve = async() => {

    const decoder = new TextDecoder();
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

api.user.keyRetrieval = async() => {
    let response = await fetch(apiUrl + '/user/retrieveapikeys', fetchOptions);
    if(!response.ok) return false;
    return await response.json();
}

api.user.keyCreation = async(description) => {
    return await fetch(apiUrl + `/user/generateapikey?description=${description.trim()}`, fetchOptions);
}

api.visualization.storedProcedureRequest = async(payload) => {
    const decoder = new TextDecoder();
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

    if(!response.ok) return false;

    let csvParser = CSVParser({from: 2});

    csvParser.on('readable', function(){
        let record;
        while (record = csvParser.read()) {
            vizData.add(record);
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

    return vizData;
}


api.visualization.getTableStats = async(tableName) => {
    let response = await fetch(apiUrl + '/dataretrieval/tablestats?table=' + tableName, fetchOptions);
    if(response.ok){
        return await response.json();
    } else return false;
}

api.visualization.cruiseTrajectoryRequest = async(payload) => {
    const cruiseId = payload.id;
    const decoder = new TextDecoder();
    let trajectory = {lats: [], lons: []};

    let response = await fetch(apiUrl + '/api/data/cruisetrajectory?' + `id=${payload.id}`, fetchOptions);

    if(!response.ok) return false;

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

export default api;

// Test for splitData
// let depthMap = {};
//     let dateMap = {};

//     let depthCount = 0;
//     vizData.depths.forEach(depth => {
//         depthMap[depth] = depthCount;
//         depthCount ++;
//     })

//     let dateCount = 0;
//     vizData.dates.forEach(date => {
//         dateMap[date] = dateCount;
//         dateCount ++;
//     })
    
//     let splitData = vizData.generatePlotData(true,true);
//     console.log(splitData);
//     for(let i = 0; i < tempArr.length; i++){
//         let theValue = tempArr[i].Fe
//         let theIndex = dateMap[tempArr[i].time] * vizData.depths.size + depthMap[tempArr[i].depth];
//         console.log(splitData[theIndex]);
//         console.log(theValue);
//         if(splitData[theIndex].includes(theValue)) console.log('correct');
//         else {
//             console.log('Incorrect'); 
//             return;
//         }
//     }

//     console.log(depthMap);
//     console.log(dateMap);