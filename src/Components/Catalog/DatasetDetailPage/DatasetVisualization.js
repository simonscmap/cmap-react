import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import states from '../../../enums/asyncRequestStates';
import {
  visualizableVariablesFetch,
  datasetVariableVisDataFetch,
} from '../../../Redux/actions/catalog';
import { ChartWrapperWithoutPaper } from '../../Visualization/Charts/ChartWrapper';
import storedProcedures from '../../../enums/storedProcedures';
import Spinner from '../../UI/Spinner';
import { makeStyles } from '@material-ui/core/styles';
import SAMPLE_VIS_MAX_QUERY_SIZE from '../../../enums/sampleVisMaxQuerySize';
import { safePath } from '../../../Utility/objectUtils';
// import visSubTypes from '../../../enums/visualizationSubTypes';
// import deepEqual from 'deep-equal';

const useStyles = makeStyles((theme) => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    // paddingTop: '100px',
  },
  iconWrapper: {
    textAlign: 'center',
    height: '100%',
    maxHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    '& img': {
      objectFit: 'contain',
      maxHeight: '200px',
    },
  },
}));

const DatasetIcon = (props) => {
  const { url, message = '' } = props;
  const cl = useStyles();
  return (
    <div className={cl.iconWrapper}>
      <img src={url} />
      <p>{message}</p>
    </div>
  );
};

const ErrorWrapper = (props) => {
  const { message } = props;
  const cl = useStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <p>{message}</p>
    </div>
  );
};

const SpinnerWrapper = (props) => {
  const { message } = props;
  const cl = useStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <Spinner message={message} />
    </div>
  );
};

const Vis = () => {
  const dispatch = useDispatch();

  // Redux State

  const selectedDatasetShortName = useSelector(
    (state) => state.datasetDetailsPage.selectedDatasetShortname,
  );

  const datasetData = useSelector(
    (state) => state.datasetDetailsPage.data || {},
  );

  const visVars = useSelector(
    (state) =>
      state.datasetDetailsPage.visualizableVariables &&
      state.datasetDetailsPage.visualizableVariables.variables,
  );

  const visVarsLoadingState = useSelector(
    (state) => state.datasetDetailsPage.visualizableVariablesLoadingState,
  );

  const selectedVisVar = useSelector(
    (state) => state.datasetDetailsPage.visualizationSelection,
  );

  const visData = useSelector(
    (state) => state.datasetDetailsPage.visualizableDataByName,
  );

  // fetch variables when short name changes
  useEffect(() => {
    if (selectedDatasetShortName) {
      if (visVarsLoadingState === states.notTried) {
        console.log(
          `dispatching Vis Var List fetch`,
          selectedDatasetShortName,
          `(loading state ${visVarsLoadingState})`,
        );
        dispatch(visualizableVariablesFetch(selectedDatasetShortName));
      } else {
        console.log(
          `declining to dispatch Vis Var List fetch`,
          selectedDatasetShortName,
          `(loading state ${visVarsLoadingState})`,
        );
      }
    } else {
      console.log(`no selected dataset short name ${selectedDatasetShortName}`);
    }
  }, [selectedDatasetShortName]);

  useEffect(() => {
    if (selectedVisVar && visData && visVars) {
      if (visData[selectedVisVar].loadingState === states.notTried) {
        const selectedVariable = visVars.find(
          (v) => v.Short_Name === selectedVisVar,
        );
        if (selectedVariable) {
          console.log(
            'dispatching vis var data fetch',
            selectedDatasetShortName,
          );
          dispatch(
            datasetVariableVisDataFetch(
              selectedVisVar,
              selectedVariable,
              selectedDatasetShortName,
            ),
          );
        } else {
          console.log(
            `declining to dispatch vis var data fetch: no visData`,
            visData,
          );
        }
      } else {
        console.log(
          `declining to dispatch vis var data fetch: loading state is ${visData[selectedVisVar].loadingState}`,
        );
      }
    }
  }, [selectedVisVar]);

  // Decide what to render

  const selectedVarState =
    selectedVisVar &&
    visData &&
    visData[selectedVisVar] &&
    visData[selectedVisVar].loadingState;
  const hasFailed =
    selectedVarState === states.failed || visVarsLoadingState === states.failed;
  const isLoading = selectedVarState === states.inProgress;
  const isProcessing = selectedVarState === states.processing;
  const notTried = selectedVarState === states.notTried;
  const isReady =
    selectedVarState === states.succeeded && visData[selectedVisVar].data;

  if (notTried) {
    return '';
    // return <DatasetIcon url={datasetData && datasetData.Icon_URL} />;
  } else if (hasFailed) {
    return <ErrorWrapper message={'Visualization is unavailable.'} />;
    // return <DatasetIcon url={datasetData && datasetData.Icon_URL} />;
  } else if (isLoading) {
    return <SpinnerWrapper message={`Fetching Visualization Data`} />;
  } else if (isProcessing) {
    return <SpinnerWrapper message={'Processing Data'} />;
  } else if (isReady) {
    const selectedVariable = visVars.find(
      (v) => v.Short_Name === selectedVisVar,
    );
    if (selectedVariable) {
      // In the present version, this component only supports Sparse and Heatmap
      // The ChartWrapper decides which chart type to use, based on chart data
      // specifically data.parameters.spName and data.subType
      // spName values are specified in enums/storedProcedures:
      // --> uspSectionMap, uspTimeSeries, uspSpaceTime, and uspDepthProfile
      // uspSpaceTime, subType are specified in enums/visualizationSubTypes:
      // --> 'Section Map', 'Contour Section Map', 'Time Series', 'Histogram', 'Depth Profile', 'Heatmap', 'Contour Map', 'Sparse'
      // NOTE: Sparse is designated with a spName of uspSpaceTime even though it uses a query, not a stored procedure
      // ¯\_(ツ)_/¯

      const chart = {
        data: visData[selectedVisVar].data,
        subType:
          'Heatmap' === selectedVariable.meta.visType ? 'Heatmap' : 'Sparse',
      };

      chart.data.parameters.spName = storedProcedures.spaceTime;
      chart.data.metadata.Data_Source = datasetData.Data_Source;
      chart.data.metadata.Dataset_Name = datasetData.Long_Name;
      chart.data.metadata.Distributor = datasetData.Distributor;

      const overrides = {
        isSampleVisualization: true,
        width: '100%',
        height: 'auto',
        minHeight: '500px',
        varyWithSize: true,
        annotationsLeft: true,
        bg: 'rgba(0,0,0,0.2)',
        truncated:
          safePath(['meta', 'metadata', 'count'])(selectedVariable) >
          SAMPLE_VIS_MAX_QUERY_SIZE,
      };

      return <ChartWrapperWithoutPaper chart={chart} overrides={overrides} />;
    } else {
      console.log(
        'State indicates vis data is ready, but could not find selected variable',
      );
      return '';
      // return <DatasetIcon url={datasetData && datasetData.Icon_URL} />;
    }
  } else {
    // console.log ('unknown visualization state', { selectedVarState });
    // this state is repeatedly met while the component is loading
    return '';
  }
};

export default Vis;
