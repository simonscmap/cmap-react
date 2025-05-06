import React, { useState, useEffect } from 'react';
// Lib
import queryString from 'query-string';
import { cleanSPParams, mapVizType } from '../helpers';
import { isProduction } from '../../../Services/env';
// Api
import api from '../../../api/api';
import { apiUrl } from '../../../api/config';

// Components
import Page from '../../Common/Page';
import Section, { FullWidthContainer } from '../../Common/Section';
import ChartWrapper from '../Charts/ChartWrapper';
import ReactJson from 'react-json-view';
// ENUMS
import temporalResolutions from '../../../enums/temporalResolutions';
import spatialResolutions from '../../../enums/spatialResolutions';
import storedProcedures from '../../../enums/storedProcedures';

// taken from VizControlPanel
const preparePayload = (params, variable) => {
  let { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2, viztype } = params;

  // defaults
  depth1 = depth1 || variable.Depth_Min;
  depth2 = depth2 || variable.Depth_Max;
  dt1 = dt1 || variable.Time_Min;
  dt2 = dt2 || variable.Time_Max;
  lat1 = lat1 || variable.Lat_Min;
  lat2 = lat2 || variable.Lat_Max;
  lon1 = lon1 || variable.Lon_Min;
  lon2 = lon2 || variable.Lon_Max;

  let mapping = mapVizType(viztype);
  let parameters = cleanSPParams({
    depth1,
    depth2,
    dt1:
      variable.Temporal_Resolution === temporalResolutions.monthlyClimatology
        ? dt1 + '-01-1900'
        : dt1,
    dt2:
      variable.Temporal_Resolution === temporalResolutions.monthlyClimatology
        ? dt2 + '-01-1900'
        : dt2,
    lat1,
    lat2,
    lon1,
    lon2,
    fields: variable.Variable,
    tableName: variable.Table_Name,
    spName: mapping.sp,
  });

  let payload = {
    parameters,
    subType: mapping.subType,
    metadata: variable,
  };
  return payload;
};

const SinglePlot = () => {
  if (isProduction) {
    window.location.href = '/';
  }
  let search = window.location.search;
  let params = queryString.parse(search);
  // console.log(params);
  let { viztype, id } = params;

  let [variable, setVariable] = useState(null);
  // let [ rawData, setRawData ] = useState(null)
  let [chart, setChart] = useState(null);

  // FETCH VARIABLE

  useEffect(() => {
    async function fetchVariable(variableId) {
      let result;
      try {
        let resp = await fetch(
          apiUrl + `/api/catalog/variable?id=${variableId}`,
          { credentials: 'include' },
        );
        result = await resp.json();
      } catch (e) {
        console.log(e);
        return;
      }
      // console.log ('variable result', result);
      setVariable(result);
    }
    if (id) {
      console.log(`fetch variable ${id}`);
      fetchVariable(id);
    }
  }, [id]);

  // FETCH CHART

  useEffect(() => {
    async function fetchSparseData(payload) {
      let result;
      try {
        result = await api.visualization.sparseDataQuerysend(payload);
      } catch (e) {
        console.log(e);
        return;
      }
      if (result && result.finalize) {
        result.finalize();
        setChart({ subType: payload.subType, data: result });
      } else {
        console.error('sparse data error', result);
      }
    }
    async function fetchStoredProcedureData(payload) {
      let result;
      try {
        result = await api.visualization.storedProcedureRequest(payload);
      } catch (e) {
        console.log(e);
        return;
      }

      if (result && result.finalize) {
        // console.log ('stored procedure result', result);
        result.finalize();
        setChart({ subType: payload.subType, data: result });
      } else {
        console.error('stored procedure error', result);
      }
    }

    if (variable && viztype) {
      let mapping = mapVizType(viztype);
      let isSparseVariable =
        variable &&
        variable.Spatial_Resolution === spatialResolutions.irregular;

      let payload = preparePayload({ ...params, viztype }, variable);
      // console.log ('payload', payload);
      if (isSparseVariable && mapping.sp !== storedProcedures.depthProfile) {
        fetchSparseData(payload);
      } else {
        fetchStoredProcedureData(payload);
      }
    } else if (!viztype) {
      console.log('no viztype parameter');
    }
  }, [variable]);

  // RENDER

  return (
    <Page pageTitle="Single Plot">
      <FullWidthContainer>
        <Section title="Args">
          <div style={{ border: '10px solid #2B303B' }}>
            <ReactJson theme="ocean" src={Object.assign({}, params)} />
          </div>
        </Section>
        <Section title="Plot">
          {chart ? (
            <div style={{ marginLeft: '-360px' }}>
              <ChartWrapper chart={chart} />
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Section>
        <Section title="Variable Info">
          {variable ? (
            <div style={{ border: '10px solid #2B303B' }}>
              <ReactJson theme="ocean" src={variable} />
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Section>
        <Section title="Plot Info">
          {chart && (
            <div style={{ border: '10px solid #2B303B' }}>
              <ReactJson
                theme="ocean"
                src={{
                  lats: chart.data.lats.length,
                  lons: chart.data.lons.length,
                  rows: chart.data.rows.length,
                }}
              />
            </div>
          )}
        </Section>
      </FullWidthContainer>
    </Page>
  );
};

export default SinglePlot;
