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

// import visSubTypes from '../../../enums/visualizationSubTypes';
// import deepEqual from 'deep-equal';

const useStyles = makeStyles ((theme) => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
}));

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

  const selectedDatasetShortName = useSelector ((state) =>
    state.datasetDetailsPage.selectedDatasetShortname);

  const dataSource = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Data_Source);

  const datasetLongName = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Long_Name);

  const visVars = useSelector ((state) =>
    state.datasetDetailsPage.visualizableVariables && state.datasetDetailsPage.visualizableVariables.variables);

  const visVarsLoadingState = useSelector ((state) =>
    state.datasetDetailsPage.visualizableVariablesLoadingState);

  const selectedVisVar = useSelector ((state) =>
    state.datasetDetailsPage.visualizationSelection);

  const visData = useSelector ((state) =>
    state.datasetDetailsPage.visualizableDataByName);

  // Derived State

  const visDataLoadingStates = visData && Object.fromEntries (Object.keys (visData).map (key => {
    return [key, { loadingState: visData[key].loadingState }];
  }));


  // fetch variables when short name changes
  useEffect (() => {
    if (selectedDatasetShortName) {
      console.log (`dispatching visualizableVariablesFetch ${selectedDatasetShortName}`);
      dispatch (visualizableVariablesFetch (selectedDatasetShortName));
    } else {
      console.log (`no selected dataset short name ${selectedDatasetShortName}`)
    }
  }, [selectedDatasetShortName]);


  useEffect (() => {
    if (selectedVisVar && visData && visVars) {
      if (visData[selectedVisVar].loadingState === states.notTried) {

        const selectedVariable = visVars.find ((v) => v.Short_Name === selectedVisVar);
        if (selectedVariable) {
          console.log (`dispatching dasatetVariableVisDataFetch ${selectedDatasetShortName}`);
          dispatch (datasetVariableVisDataFetch (selectedVisVar, selectedVariable));
        } else {
         console.log (`declining to dispatch dasatetVariableVisDataFetch: no plot type to reference`, selectedVariable);
        }
      } else {
        console.log (`declining to dispatch dasatetVariableVisDataFetch: no visData to reference`, visData);
      }
    }
  }, [selectedVisVar]);


  const stringUpdate = `
      selcted dataset short name: ${selectedDatasetShortName}
      vis var loading state: ${visVarsLoadingState}
      selected vis var: ${selectedVisVar}
      selected var loading: ${visData && visDataLoadingStates && visDataLoadingStates[selectedVisVar]}
      vis data loading states: ${JSON.stringify (visDataLoadingStates, null, 2)}
  `;

  const selectedVarState = selectedVisVar && visData && visData[selectedVisVar] && visData[selectedVisVar].loadingState;
  const hasFailed = selectedVarState === states.failed;
  const isLoading = selectedVarState === states.inProgress;
  const isProcessing = selectedVarState === states.processing;
  const notTried = selectedVarState === states.notTried;
  const isReady = selectedVarState === states.succeeded && visData[selectedVisVar].data;

  if (notTried) {
    return <SpinnerWrapper message={'Initiating'} />;
  } else if (hasFailed) {
    return 'Failed to load data for selected variable';
  } else if (isLoading) {
    return <SpinnerWrapper message={`Loading`} />
  } else if (isProcessing) {
    return <SpinnerWrapper message={'Processing'} />
  } else if (isReady) {
    const selectedVariable = visVars.find ((v) => v.Short_Name === selectedVisVar);
    if (selectedVariable) {
      // In the present version, this component only supports Histogram and Heatmap
      // The ChartWrapper decides which chart type to use, based on chart data
      // specifically data.parameters.spName and data.subType
      // spName values are specified in enums/storedProcedures:
      // --> uspSectionMap, uspTimeSeries, uspSpaceTime, and uspDepthProfile
      // uspSpaceTime, subType are specified in enums/visualizationSubTypes:
      // --> 'Section Map', 'Contour Section Map', 'Time Series', 'Histogram', 'Depth Profile', 'Heatmap', 'Contour Map', 'Sparse'
      // NOTE: Histogram is designated with a spName of uspSpaceTiem even though it uses a query, not a stored procedure
      // ¯\_(ツ)_/¯

      const chart = {
        data: visData[selectedVisVar].data,
        subType: selectedVariable.meta.visType,
      };

      chart.data.parameters.spName = storedProcedures.spaceTime;
      chart.data.metadata.Data_Source = dataSource;
      chart.data.metadata.Dataset_Name = datasetLongName;

      const styleOverrides = {
        width: '100%',
        height: 'auto',
      };

      return <ChartWrapperWithoutPaper chart={chart} styleOverrides={styleOverrides}/>;

    } else {
      return 'Failed to load';
    }
  } else {
    return '';
  }
};

export default Vis;
