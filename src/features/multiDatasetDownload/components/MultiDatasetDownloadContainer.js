import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import SubsetControls from '../../../shared/filtering/core/SubsetControls';
import DefaultSubsetControlsLayout from '../../../shared/filtering/components/DefaultSubsetControlsLayout';
import useSubsetFiltering from '../../../shared/filtering/hooks/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import MultiDatasetDownloadTable from './MultiDatasetDownloadTable';
import DownloadButton from './DownloadButton';

/**
 * Multi-Dataset Download Container Component
 * Provides a complete interface for downloading multiple datasets with filtering capabilities
 *
 * @param {Array<Object>} props.datasetsMetadata - Array of dataset metadata objects
 *
 * Each dataset metadata object should contain the following fields:
 *
 * REQUIRED FIELDS:
 * @param {string} dataset.Dataset_Name - Unique dataset identifier (used for selection/deselection)
 * @param {number} dataset.Lat_Min - Minimum latitude boundary
 * @param {number} dataset.Lat_Max - Maximum latitude boundary
 * @param {number} dataset.Lon_Min - Minimum longitude boundary
 * @param {number} dataset.Lon_Max - Maximum longitude boundary
 * @param {string} dataset.Time_Min - Minimum time boundary (ISO date string)
 * @param {string} dataset.Time_Max - Maximum time boundary (ISO date string)
 * @param {number} dataset.Row_Count - Initial row count for the dataset (displayed in table)
 *
 * OPTIONAL FIELDS:
 * @param {number} [dataset.Depth_Min=0] - Minimum depth boundary (defaults to 0)
 * @param {number} [dataset.Depth_Max=0] - Maximum depth boundary (defaults to 0)
 * @param {string} [dataset.Temporal_Resolution="daily"] - Temporal resolution (e.g., "monthly", "daily")
 *
 * The component automatically computes aggregate bounds across all datasets for filtering
 * and initializes internal Zustand stores for state management.
 */
const MultiDatasetDownloadContainer = ({ datasetShortNames }) => {
  const {
    datasetsMetadata,
    fetchDatasetsMetadata,
    resetStore,
    isLoading,
    error,
  } = useMultiDatasetDownloadStore();
  const { updateRowCountsForFilters } = useRowCountStore();
  // Compute aggregate dataset bounds for multi-dataset filtering
  const aggregateDatasetMetadata = useMemo(() => {
    if (!datasetsMetadata || datasetsMetadata.length === 0) {
      return null;
    }

    const validDatasets = datasetsMetadata.filter(
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
  }, [datasetsMetadata]);

  // State for toggle controls (required by layout components)
  const [optionsState, setOptionsState] = useState({
    subset: false,
  });
  // Handle toggle switch for subset controls
  const handleSwitch = (event) => {
    const controlType = event.target.name;
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
  } = useSubsetFiltering(aggregateDatasetMetadata);

  // Fetch datasets metadata once on component mount
  useEffect(() => {
    if (datasetShortNames && datasetShortNames.length > 0) {
      fetchDatasetsMetadata(datasetShortNames);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update row counts when filters change
  useEffect(() => {
    if (filterValues.isFiltered) {
      updateRowCountsForFilters(filterValues);
    }
  }, [filterValues, updateRowCountsForFilters]);

  // Reset store when component unmounts
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  return (
    <Box
      sx={{ maxWidth: '100vw', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      <Typography variant="h6" gutterBottom>
        Multi-Dataset Download
      </Typography>

      <Box mb={3} p={2}>
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
        {datasetsMetadata && datasetsMetadata.length > 0 && (
          <MultiDatasetDownloadTable />
        )}
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
