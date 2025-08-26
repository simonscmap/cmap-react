import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import SubsetControls from '../../../shared/filtering/SubsetControls';
import useSubsetFiltering from '../../../shared/filtering/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';

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

  // State for invalid flag (required by SubsetControls)
  const [isInvalid, setInvalidFlag] = useState(false);

  // Initialize subset filtering without specific dataset (multi-dataset mode)
  const subsetFiltering = useSubsetFiltering(null);

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
          setInvalidFlag={setInvalidFlag}
          subsetFiltering={subsetFiltering}
        />
      </Box>

      {/* Placeholder for MultiDatasetDownloadTable - Task 3 */}
      <Box mb={2}>
        <Typography variant="body2" color="textSecondary">
          Dataset selection table will be implemented in Task 3
        </Typography>
      </Box>

      {/* Placeholder for DownloadButton - Task 5 */}
      <Box>
        <Typography variant="body2" color="textSecondary">
          Download button will be implemented in Task 5
        </Typography>
      </Box>
    </Box>
  );
};

export default MultiDatasetDownloadContainer;
