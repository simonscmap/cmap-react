import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import UniversalButton from '../../../shared/components/UniversalButton';
import deepEqual from 'deep-equal';
import SubsetControls from '../../../shared/filtering/core/SubsetControls';
import CompactSubsetControlsLayout from '../../../shared/filtering/components/CompactSubsetControlsLayout';
import useSubsetFiltering from '../../../shared/filtering/hooks/useSubsetFiltering';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import { aggregateDatasetMetadata } from '../utils/aggregateDatasetMetadata';
import { initializeRowCounts, clearRowCounts, reEstimateWithConstraints } from '../../rowCount';
import { transformConstraintsForRowCount } from '../utils/constraintTransformer';
import MultiDatasetDownloadTable from './MultiDatasetDownloadTable';
import DownloadButton from './DownloadButton';
import RowCountTotal from './RowCountTotal';
import logInit from '../../../Services/log-service';
import { FeatureErrorBoundary } from '../../../shared/errorCapture';

import {
  SearchProvider,
  SearchInput,
  useFilteredItems,
} from '../../../shared/UniversalSearch';

import { SpinnerWrapper } from '../../../Components/UI/Spinner';

const log = logInit('MultiDatasetDownloadContainer');

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
const MultiDatasetDownloadContainerInner = ({
  aggregateDatasetMetadata,
  onDownloadComplete,
}) => {
  const { resetStore } = useMultiDatasetDownloadStore();
  const filteredItems = useFilteredItems();

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

  // Reset store when component unmounts
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  useEffect(() => {
    if (filteredItems?.length > 0) {
      const shortNames = filteredItems.map((d) => d.Dataset_Name);
      const constraints = transformConstraintsForRowCount(filterValues);
      log.debug('initializing row count feature', {
        datasetCount: shortNames.length,
        constraints,
      });
      initializeRowCounts(shortNames, constraints);
    }
    return () => {
      clearRowCounts();
    };
  }, [filteredItems]); 

  useEffect(() => {
    if (filteredItems?.length > 0) {
      const constraints = transformConstraintsForRowCount(filterValues);
      reEstimateWithConstraints(constraints);
    }
  }, [filterValues]); 

  return (
    <Box
      sx={{ maxWidth: '100vw', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      <Box mb={3} p={2}>
        <SubsetControls
          setInvalidFlag={setInvalidFlag}
          filterValues={filterValues}
          filterSetters={filterSetters}
          datasetFilterBounds={datasetFilterBounds}
          dateHandling={dateHandling}
        >
          <CompactSubsetControlsLayout
            optionsState={optionsState}
            handleSwitch={handleSwitch}
          />
        </SubsetControls>
      </Box>

      <Box mb={3} p={2}>
        <SearchInput placeholder="Search datasets..." />
      </Box>

      <Box mb={3}>
        <MultiDatasetDownloadTable
          datasetsMetadata={filteredItems}
          filterValues={filterValues}
        />
      </Box>

      <Box>
        <RowCountTotal filterValues={filterValues} />
        <DownloadButton
          subsetFiltering={{
            setInvalidFlag,
            filterValues,
            filterSetters,
            datasetFilterBounds,
            dateHandling,
          }}
          onDownloadComplete={onDownloadComplete}
        />
      </Box>
    </Box>
  );
};

const MultiDatasetDownloadContainer = React.memo(
  ({ datasetShortNames, downloadContext, onDownloadComplete }) => {
    const {
      datasetsMetadata,
      fetchDatasetsMetadata,
      isLoading,
      error,
      setDownloadContext,
    } = useMultiDatasetDownloadStore();

    // Compute aggregate dataset bounds for multi-dataset filtering
    const aggregateMetadata = useMemo(() => {
      return aggregateDatasetMetadata(datasetsMetadata);
    }, [datasetsMetadata]);

    useEffect(() => {
      if (datasetShortNames && datasetShortNames.length > 0) {
        fetchDatasetsMetadata(datasetShortNames);
      }
    }, [datasetShortNames, fetchDatasetsMetadata]);

    // Set download context when provided
    useEffect(() => {
      if (downloadContext) {
        setDownloadContext(downloadContext);
      }
    }, [downloadContext, setDownloadContext]);

    // Handler for retrying failed initialization
    const handleRetry = () => {
      if (datasetShortNames && datasetShortNames.length > 0) {
        fetchDatasetsMetadata(datasetShortNames);
      }
    };

    // Handle error state with retry option
    if (error) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          textAlign="center"
          p={3}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Unable to Load Download Data
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ marginBottom: '16px' }}
          >
            {error}
          </Typography>
          <UniversalButton
            variant="primary"
            size="medium"
            onClick={handleRetry}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </UniversalButton>
        </Box>
      );
    }

    if (isLoading || !datasetsMetadata || datasetsMetadata.length === 0) {
      return <SpinnerWrapper message={'Loading data for download...'} />;
    }

    if (!aggregateMetadata) {
      return <SpinnerWrapper message={'Loading data for download...'} />;
    }

    return (
      <SearchProvider items={datasetsMetadata} searchKeys={['Dataset_Name']}>
        <MultiDatasetDownloadContainerInner
          aggregateDatasetMetadata={aggregateMetadata}
          onDownloadComplete={onDownloadComplete}
        />
      </SearchProvider>
    );
  },
  (prevProps, nextProps) => {
    return (
      deepEqual(prevProps.datasetShortNames, nextProps.datasetShortNames) &&
      deepEqual(prevProps.downloadContext, nextProps.downloadContext)
    );
  },
);

const MultiDatasetDownloadContainerWithErrorBoundary = (props) => (
  <FeatureErrorBoundary featureName="multiDatasetDownload">
    <MultiDatasetDownloadContainer {...props} />
  </FeatureErrorBoundary>
);

export default MultiDatasetDownloadContainerWithErrorBoundary;
