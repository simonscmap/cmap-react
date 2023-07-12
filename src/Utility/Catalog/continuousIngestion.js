import React from 'react';
import { useSelector } from 'react-redux';

export const tableIsContinuouslyIngested = (
  tablesWithCI,
  datasetShortName,
) => {
  return Boolean(tablesWithCI[datasetShortName]);
};

// :: String -> Boolean
export const useTableIsCI = (datasetShortName) => {
  let tablesWithCI = useSelector(
    (state) => state.tablesWithContinuousIngestion,
  );

  if (!tablesWithCI) {
    return false;
  }

  return tableIsContinuouslyIngested (tablesWithCI, datasetShortName);
}
