import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Skeleton } from '@material-ui/lab';
import { programSampleVisDataFetch } from '../../../../Redux/actions/catalog';
import {
  programDatasetsSelector,
  selectedProgramDatasetDataSelector,
  selectedProgramDatasetVariableSelector,
  sampleVisualizationDataSelector,
  selectedProgramDatasetShortNameSelector,
} from '../programSelectors';
import { SpinnerWrapper, ErrorWrapper } from '../../../UI/Spinner';
import { ChartWrapperWithoutPaper } from '../../../Visualization/Charts/ChartWrapper';

import storedProcedures from '../../../../enums/storedProcedures';
import states from '../../../../enums/asyncRequestStates';
import { safePath } from '../../../../Utility/objectUtils';
import SAMPLE_VIS_MAX_QUERY_SIZE from '../../../../enums/sampleVisMaxQuerySize';

// given the selection and the loaded datasets, return the variable data
const getVariableData = (selectedVar, datasets) => {
  if (!selectedVar || !datasets) {
    return null;
  }

  const { varShortName, datasetId } = selectedVar;
  const values = Object.values(datasets);
  const dataset = Object.values(datasets).find((d) => d.ID === datasetId);

  if (dataset && dataset.visualizableVariables) {
    const variable = dataset.visualizableVariables.variables.find(
      (v) => v.Short_Name === varShortName,
    );
    if (variable) {
      return variable;
    } else {
      return null;
    }
  } else {
    console.log(
      'could not look for variable, no dataset',
      { datasetId, dataset },
      values,
    );
    return null;
  }
};

const selectionAndDataMatch = (variableData, visualizationData) => {
  if (!variableData || !visualizationData) {
    return false;
  }

  const { varShortName } = variableData;
  const { variableData: vd } = visualizationData;

  // compare both dataset and variable
  return varShortName === vd.Short_Name;
};

const SampleVisualization = () => {
  const dispatch = useDispatch();

  // program details
  const programDatasets = useSelector(programDatasetsSelector);

  const selectedDataset = useSelector(selectedProgramDatasetDataSelector);

  // selectedDatasetShortName
  const datasetShortName = useSelector(selectedProgramDatasetShortNameSelector);

  // selectedVariable // { varShortName, varId, datasetId }
  const selectedVariable = useSelector(selectedProgramDatasetVariableSelector);

  // visualizationData // { datasetShortName, variableId, loadingState, data }
  const visualizationData = useSelector(sampleVisualizationDataSelector);

  // fetch new visualization data when variable selection changes
  useEffect(() => {
    if (selectedVariable) {
      if (!selectionAndDataMatch(selectedVariable, visualizationData)) {
        const variableData = getVariableData(selectedVariable, programDatasets);
        if (variableData) {
          dispatch(
            programSampleVisDataFetch({
              datasetShortName,
              variableId: selectedVariable.varId,
              variableData,
            }),
          );
        } else {
          console.log('no variable data', variableData);
        }
      } else {
        console.log(
          `declined to fetch sample vis data: already loaded`,
          selectedVariable,
          visualizationData,
        );
      }
    } else {
      console.log(`declined to fetch sample vis data: no selection`);
    }
  }, [selectedVariable, visualizationData]);

  // Decide what to render

  const selectedVarState = visualizationData && visualizationData.loadingState;
  const hasFailed = selectedVarState === states.failed;
  const isLoading = selectedVarState === states.inProgress;
  const isProcessing = selectedVarState === states.processing;
  const notTried = selectedVarState === states.notTried;
  const isReady =
    selectedVarState === states.succeeded && visualizationData.data;

  if (notTried) {
    return <Skeleton />;
  } else if (hasFailed) {
    return <ErrorWrapper message={'Visualization is unavailable.'} />;
  } else if (isLoading) {
    return <SpinnerWrapper message={`Fetching Visualization Data`} />;
  } else if (isProcessing) {
    return <SpinnerWrapper message={'Processing Data'} />;
  } else if (isReady) {
    // In the present version, this component only supports Sparse and Heatmap
    // The ChartWrapper decides which chart type to use, based on chart data
    // specifically data.parameters.spName and data.subType
    // spName values are specified in enums/storedProcedures:
    // --> uspSectionMap, uspTimeSeries, uspSpaceTime, and uspDepthProfile
    // uspSpaceTime, subType are specified in enums/visualizationSubTypes:
    // --> 'Section Map', 'Contour Section Map', 'Time Series', 'Histogram', 'Depth Profile', 'Heatmap', 'Contour Map', 'Sparse'
    // NOTE: Sparse is designated with a spName of uspSpaceTime even though it uses a query, not a stored procedure
    // ¯\_(ツ)_/¯

    const data = visualizationData.data;
    const visType = safePath(['variableData', 'meta', 'visType'])(
      visualizationData,
    );
    const chart = {
      data,
      subType: 'Heatmap' === visType ? 'Heatmap' : 'Sparse',
    };

    chart.data.parameters.spName = storedProcedures.spaceTime;
    chart.data.metadata.Data_Source = selectedDataset.Data_Source;
    chart.data.metadata.Dataset_Name = selectedDataset.Long_Name;
    chart.data.metadata.Distributor = selectedDataset.Distributor;

    const overrides = {
      isSampleVisualization: true,
      width: '100%',
      height: '635px',
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
    return '';
  }
};

export default SampleVisualization;
