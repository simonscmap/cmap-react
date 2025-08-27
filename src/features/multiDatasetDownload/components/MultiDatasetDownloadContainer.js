import React, { useState, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import SubsetControls from '../../../shared/filtering/SubsetControls';
import DefaultSubsetControlsLayout from '../../../shared/filtering/DefaultSubsetControlsLayout';
import useSubsetFiltering from '../../../shared/filtering/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useFilteringBridge from '../hooks/useFilteringBridge';
import MultiDatasetDownloadTable from './MultiDatasetDownloadTable';
import DownloadButton from './DownloadButton';

const MultiDatasetDownloadContainer = ({ datasets = [] }) => {
  // Initialize Zustand store with datasets
  const { initializeDatasets } = useMultiDatasetDownloadStore();

  // State for toggle controls (required by layout components)
  const [optionsState, setOptionsState] = useState({
    subset: true,
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

  // Initialize store once on mount
  useMemo(() => {
    initializeDatasets(datasets);
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Multi-Dataset Download
      </Typography>

      <Box mb={3}>
        <SubsetControls
          setInvalidFlag={subsetFiltering.setInvalidFlag}
          filterValues={subsetFiltering.filterValues}
          filterSetters={subsetFiltering.filterSetters}
          datasetFilterBounds={subsetFiltering.datasetFilterBounds}
          dateHandling={subsetFiltering.dateHandling}
        >
          <DefaultSubsetControlsLayout
            optionsState={optionsState}
            handleSwitch={handleSwitch}
          />
        </SubsetControls>
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
