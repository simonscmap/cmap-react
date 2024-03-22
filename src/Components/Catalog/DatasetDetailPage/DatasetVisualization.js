import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import states from '../../../enums/asyncRequestStates';
import { visualizableVariablesFetch, visualizableVariablesSetLoadingState } from '../../../Redux/actions/catalog';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../../enums/sparseDataQueryMaxSize';
import deepEqual from 'deep-equal';

const sparseDataQueryFromPayload = (data) => {
  let { metadata, parameters } = data;
  let { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2, fields } = parameters;
  let depthSelectPart = metadata.Depth_Max ? 'depth, ' : '';
  let depthOrderPart = metadata.Depth_Max ? ', depth' : '';

  let query = `SELECT TOP ${SPARSE_DATA_QUERY_MAX_SIZE} time, lat, lon, ${depthSelectPart}${fields} FROM ${parameters.tableName} WHERE ${fields} IS NOT NULL ORDER BY time desc, lat, lon${depthOrderPart}`;

  return query;
};


const storedProcedureParametersToUri = (parameters) => {
  let result = Object.keys(parameters).reduce(function (queryString, key, i) {
    return `${queryString}${i === 0 ? '' : '&'}${key}=${parameters[key]}`;
  }, '');
  return result;
};



const munge = (variable, datasetStats) => {
  const s = datasetStats;
  return {
    metadata: {
      Depth_Max: s.depth.max,
    },
    parameters: {
      dt1: s.time.max,
      dt2: s.time.max,
      lat1: s.lat.min,
      lat2: s.lat.max,
      lon1: s.lon.min,
      lon2: s.lon.max,
      depth1: s.depth.min,
      depth2: s.depth.max,
      fields: variable.Short_Name,
      tableName: variable.Table_Name,
    }
  };
};

const Vis = () => {
  const data = useSelector ((state) =>
    state.datasetDetailsPage.visualizableVariables);
  const loadingState = useSelector ((state) =>
    state.datasetDetailsPage.visualizableVariablesLoadingState);
  const datasetShortName = useSelector ((state) =>
    state.datasetDetailsPage.selectedDatasetShortname);
  const dispatch = useDispatch();

  let [datasetName, setDatasetName] = useState(null);
  let [result, setResult] = useState(null);

  useEffect (() => {
    if (data) {
      const variables = data.data.map ((v) => {
        const m = munge (v, data.stats);
        let q;
        if (v.meta.visType === 'Histogram') {
          q = sparseDataQueryFromPayload (m);
        } else if (v.meta.visType === 'Heatmap' ){
          q = storedProcedureParametersToUri (m.parameters);
        }
        return Object.assign(v, { query: q, params: m });
      });
      if (!deepEqual (variables, result)) {
        console.log(variables);
        setResult(variables);
      }
    }
  }, [data]);

  useEffect (() => {
    // when component load, reset loading
    if (datasetShortName && datasetShortName !== datasetName) {
      console.log (`name change: dispatching (${datasetShortName}/${datasetName})`);
      dispatch (visualizableVariablesFetch (datasetShortName));
      setDatasetName(datasetShortName);
    } else {
      console.log (`name change: pass (${datasetShortName}/${datasetName})`);
    }
  }, [datasetShortName]);

  return ('');
};

export default Vis;
