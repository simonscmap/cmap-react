// eslint-disable-next-line
import React from 'react';
import { useSelector } from 'react-redux';

// hook to provide which data features are available for a particular table

export const useDatasetFeatures = (tableName = '', featureFlag = false) => {
  let datasetFeatures = useSelector(
    (state) => state.catalog.datasetFeatures,
  );

  // if there is no data, return null
  if (!datasetFeatures) {
    return null;
  }

  let tableFeatures = datasetFeatures[tableName.toLowerCase()];

  // if there are no features for this table name, return false
  if (!tableFeatures) {
    return false;
  }

  // if a specific feature flag was requested,
  // return the value of that flag for this table
  if (featureFlag) {
    return tableFeatures[featureFlag];
  }

  // otherwise, return the features for this table
  return tableFeatures;
}
