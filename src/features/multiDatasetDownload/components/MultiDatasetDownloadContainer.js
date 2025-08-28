import React, { useState, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import SubsetControls from '../../../shared/filtering/SubsetControls';
import DefaultSubsetControlsLayout from '../../../shared/filtering/DefaultSubsetControlsLayout';
import useSubsetFiltering from '../../../shared/filtering/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import MultiDatasetDownloadTable from './MultiDatasetDownloadTable';
import DownloadButton from './DownloadButton';

const MultiDatasetDownloadContainer = ({ datasets = [] }) => {
  // Initialize Zustand store with datasets
  const { initializeDatasets } = useMultiDatasetDownloadStore();
  // Compute aggregate dataset bounds for multi-dataset filtering
  const aggregateDataset = useMemo(() => {
    if (!datasets || datasets.length === 0) {
      return null;
    }

    const validDatasets = datasets.filter(
      (d) =>
        d.Lat_Min !== undefined &&
        d.Lat_Max !== undefined &&
        d.Lon_Min !== undefined &&
        d.Lon_Max !== undefined,
    );

    if (validDatasets.length === 0) return null;

    return {
      Lat_Min: Math.min(...validDatasets.map((d) => d.Lat_Min)),
      Lat_Max: Math.max(...validDatasets.map((d) => d.Lat_Max)),
      Lon_Min: Math.min(...validDatasets.map((d) => d.Lon_Min)),
      Lon_Max: Math.max(...validDatasets.map((d) => d.Lon_Max)),
      Depth_Min: Math.min(...validDatasets.map((d) => d.Depth_Min || 0)),
      Depth_Max: Math.max(...validDatasets.map((d) => d.Depth_Max || 0)),
      Time_Min: validDatasets.reduce(
        (min, d) =>
          !min || (d.Time_Min && d.Time_Min < min) ? d.Time_Min : min,
        null,
      ),
      Time_Max: validDatasets.reduce(
        (max, d) =>
          !max || (d.Time_Max && d.Time_Max > max) ? d.Time_Max : max,
        null,
      ),
      Temporal_Resolution: validDatasets[0]?.Temporal_Resolution || 'daily',
    };
  }, [datasets]);

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

  const {
    setInvalidFlag,
    filterValues,
    filterSetters,
    datasetFilterBounds,
    dateHandling,
  } = useSubsetFiltering(aggregateDataset);

  // Initialize store when datasets change
  useMemo(() => {
    initializeDatasets(datasets);
  }, [datasets, initializeDatasets]);

  return (
    <Box
      sx={{ maxWidth: '100vw', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      <Typography variant="h6" gutterBottom>
        Multi-Dataset Download
      </Typography>

      <Box mb={3}>
        <SubsetControls
          setInvalidFlag={setInvalidFlag}
          filterValues={filterValues}
          filterSetters={filterSetters}
          datasetFilterBounds={datasetFilterBounds}
          dateHandling={dateHandling}
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
        <DownloadButton
          subsetFiltering={{
            setInvalidFlag,
            filterValues,
            filterSetters,
            datasetFilterBounds,
            dateHandling,
          }}
        />
      </Box>
    </Box>
  );
};

export default MultiDatasetDownloadContainer;
