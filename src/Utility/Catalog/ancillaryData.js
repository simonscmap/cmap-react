import React from 'react';
import { useSelector } from 'react-redux';

export const tableHasAncillaryData = (tablesWithAncillaryData, datasetShortName) => {
  return Boolean(tablesWithAncillaryData[datasetShortName]);
}

export const useTableHasAncillaryData = (datasetShortName) => {
  let tablesWithAncillaryData = useSelector(state => state.tablesWithAncillaryData);

  if (!tablesWithAncillaryData) {
    return false;
  }

  return tableHasAncillaryData(tablesWithAncillaryData, datasetShortName);
}
