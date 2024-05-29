import { createSelector } from 'reselect';

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
  [ (state) => state.programDetails && state.programDetails.datasets],
  (programDatasets) => programDatasets
);


export const selectedProgramDatasetSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.programDatasetSelected],
  (selectedDataset) => selectedDataset
);

export const selectedProgramDatasetVariableSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.programDatasetVariableSelected],
  (selectedDatasetVariable) => selectedDatasetVariable
);

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


export const selectedProgramDatasetShortNameSelector = createSelector(
  [ selectedProgramDatasetSelector ],
  (selectedDataset) => selectedDataset && selectedDataset.shortName
);

export const selectedProgramDatasetVariableShortNameSelector = createSelector(
  [
    selectedProgramDatasetVariableSelector,
    selectedProgramDatasetDataSelector
  ],
  (selectedVariable, selectedDataset) => {
    const v = selectedVariable
        && selectedDataset
        && selectedDataset.visualizableVariables
        && selectedDataset.visualizableVariables.variables.find ((variable) => variable.Short_Name === selectedVariable.varShortName)
    if (v) {
      return v.Short_Name;
    }
    return null;
  }
);
