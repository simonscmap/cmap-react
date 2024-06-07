import { createSelector } from 'reselect';
import { safePath } from '../../../Utility/objectUtils';

export const getFirstDatasetIdentifier = (datasets) => {
  if (!datasets) {
    return;
  }
  const ids = Object.keys(datasets).sort();

  if (ids.length) {
    const d = datasets[ids[0]];
    return {
      shortName: d.Dataset_Name,
      datasetId: d.ID,
    };
  } else {
    return;
  }
}

export const getDefaultVariableIdentifier = (datasets) => {
  const d_ = getFirstDatasetIdentifier (datasets);
  if (!d_) {
    return;
  }
  const d = datasets[`${d_.datasetId}`];
  const variables = safePath (['visualizableVariables', 'variables']) (d);

  if (!variables) {
    return;
  }

  const ids = Object.keys(variables).sort();

  if (ids.length) {
    const v = variables[ids[0]];
    return {
      varShortName: v.Short_Name,
      varId: d.ID,
      datasetId: d_.datasetId,
    };
  } else {
    return;
  }
};

export const trajectorySelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.cruises ],
  (cruises) => {
    if (!cruises) {
      return [];
    } else {
      return Object.keys(cruises).reduce((acc, currKey) => {
        if (cruises[currKey] && cruises[currKey].trajectory) {
          Object.assign(acc, { [currKey]: cruises[currKey].trajectory })
        }
        return acc;
      }, {});
    }
  }
);

export const cruiseSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.cruises ],
  (cruises) => {
    if (!cruises) {
      return [];
    } else {
      return Object.values(cruises);
    }
  }
);

export const activeTrajectorySelector = createSelector(
  [
    (state) => state.programDetails && state.programDetails.cruises,
    (state) => state.programDetailsCruiseFocus,
  ],
  (cruises, focusId) => {
    if (!cruises) {
      return null;
    } else if (!focusId) {
      return null; // NOTE allow for no cruise to be in focus
      // return {
      //   cruiseId: Object.values(cruises)[0].ID,
      //   trajectory: Object.values(cruises)[0].trajectory
      // }
    } else {
      if (cruises[focusId]) {
        return {
          cruiseId: focusId,
          trajectory: cruises[focusId].trajectory,
        }
      } else {
        return null;
      }
    }
  }
);

export const programDatasetsSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails ],
  (programDetails) => programDetails && programDetails.datasets
);

// user selection: dataset

export const selectedProgramDatasetSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.programDatasetSelected ],
  (selectedDataset) => selectedDataset
);

// user selection: dataset variable
export const selectedProgramDatasetVariableSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails ],
  (programDetails) => {
    if (programDetails && programDetails.programDatasetVariableSelected) {
      return programDetails.programDatasetVariableSelected;
    } else {
      return null;
    }
  }
);

// user selection: dataset short name
export const selectedProgramDatasetShortNameSelector = createSelector(
  [ selectedProgramDatasetSelector ],
  (selectedDataset) => selectedDataset && selectedDataset.shortName
);

// selected dataset data
export const selectedProgramDatasetDataSelector = createSelector(
  [
    selectedProgramDatasetSelector,
    programDatasetsSelector,
  ],
  (selectedDataset, datasets) => {
    if (!datasets) {
      return null;
    } else if (!selectedDataset) {
      const first = Object.keys(datasets)[0];
      return datasets[first];
    } else if (selectedDataset && selectedDataset.datasetId && datasets) {
      return datasets[selectedDataset.datasetId];
    } else {
      return null;
    }
  }
);

export const selectedProgramDatasetVariableShortNameSelector = createSelector(
  [
    selectedProgramDatasetVariableSelector,
  ],
  (selectedVariable) => {
    if (!selectedVariable) {
      return null;
    } else {
      const { varShortName } = selectedVariable
      return varShortName
    }
  }
);

export const selectedVariableDataSelector = createSelector (
  [
    (state) => state.programDetails && state.programDetails && state.programDetails.programDatasetVariableSelected,
    programDatasetsSelector
  ],
  (selectedVar, datasets) => {
    if (!selectedVar || !datasets) {
      return null;
    }
    const { varShortName, datasetId } = selectedVar;
    const dataset = Object.values(datasets).find ((d) => d.ID === datasetId);
    if (dataset && dataset.visualizableVariables) {
      const variable = dataset.visualizableVariables.variables.find ((v) =>
        v.Short_Name === varShortName);
      if (variable) {
        return variable;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
);

// sample vis data
export const sampleVisualizationDataSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.sampleVisData ],
  (visData) => visData
);

// sample vis data loading state
export const sampleVisualizationDataLoadingStateSelector = createSelector(
  [ sampleVisualizationDataSelector ],
  (visData) => visData && visData.loadingState
);
