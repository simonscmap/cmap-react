import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import SubsetControls from '../../../shared/filtering/SubsetControls';
import useSubsetFiltering from '../../../shared/filtering/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useFilteringBridge from '../hooks/useFilteringBridge';
import MultiDatasetDownloadTable from './MultiDatasetDownloadTable';
import DownloadButton from './DownloadButton';

const MultiDatasetDownloadContainer = ({ datasets = [] }) => {
  // Initialize Zustand store with datasets
  const { setDatasets } = useMultiDatasetDownloadStore();

  // State for toggle controls (required by SubsetControls)
  const [optionsState, setOptionsState] = useState({
    date: true,
    latitude: true,
    longitude: true,
    depth: true,
  });

  // Handle toggle switch for subset controls
  const handleSwitch = (controlType) => {
    setOptionsState((prev) => ({
      ...prev,
      [controlType]: !prev[controlType],
    }));
  };

  // Initialize subset filtering without specific dataset (multi-dataset mode)
  const subsetFiltering = useSubsetFiltering(null);

  // Bridge to sync subset filtering state with Zustand store
  useFilteringBridge(subsetFiltering);

  // Update store when datasets prop changes
  useEffect(() => {
    setDatasets(datasets);
  }, [datasets, setDatasets]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Multi-Dataset Download
      </Typography>

      <Box mb={3}>
        <SubsetControls
          dataset={null} // Multi-dataset mode - no specific dataset
          optionsState={optionsState}
          handleSwitch={handleSwitch}
          setInvalidFlag={subsetFiltering.setInvalidFlag}
          subsetFiltering={subsetFiltering}
        />
      </Box>

      <Box mb={3}>
        <MultiDatasetDownloadTable />
      </Box>

      <Box>
        <DownloadButton />
      </Box>
    </Box>
  );
};

export default MultiDatasetDownloadContainer;
