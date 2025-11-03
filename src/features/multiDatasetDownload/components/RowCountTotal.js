import React from 'react';
import { Typography, Box } from '@material-ui/core';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import temporalResolutions from '../../../enums/temporalResolutions';

const styles = {
  container: {
    height: 72, // Fixed height to completely prevent layout shift
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  text: {
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  warningText: {
    fontSize: '0.75rem',
    marginTop: 4,
    fontWeight: 500,
  },
};

const RowCountTotal = () => {
  const { selectedDatasets, datasetsMetadata } = useMultiDatasetDownloadStore();
  const { getThresholdStatus } = useRowCountStore();

  const thresholdStatus = getThresholdStatus(selectedDatasets);
  const { totalRows, maxRows, isLoading, isOverThreshold } = thresholdStatus;

  // Check if any selected datasets are Monthly Climatology
  const hasMonthlyClimatology = React.useMemo(() => {
    if (!datasetsMetadata || selectedDatasets.size === 0) return false;

    return Array.from(selectedDatasets).some((datasetName) => {
      const dataset = datasetsMetadata.find(
        (d) => d.Dataset_Name === datasetName,
      );
      // Check either by explicit Temporal_Resolution or by null Time_Min AND Time_Max
      return (
        dataset?.Temporal_Resolution ===
          temporalResolutions.monthlyClimatology ||
        (dataset?.Time_Min === null && dataset?.Time_Max === null)
      );
    });
  }, [selectedDatasets, datasetsMetadata]);
  const getWarningColor = () => {
    if (isOverThreshold) return '#f44336'; // Red
    if (hasMonthlyClimatology) return '#ff9800'; // Orange/amber for info
    return null;
  };

  const getWarningMessage = () => {
    // Priority: Threshold warning takes precedence over climatology info
    if (isOverThreshold) {
      const excessRows = totalRows - maxRows;
      return `Selection exceeds limit by ${excessRows.toLocaleString()} rows`;
    }

    // Show climatology info message only when no threshold warning
    if (hasMonthlyClimatology) {
      return 'One or more Monthly Climatology datasets are included. These use only month values from your date range (ignoring year and day). If you need different months for Monthly Climatology datasets than for other datasets, download them separately.';
    }

    return null;
  };

  const warningColor = getWarningColor();
  const warningMessage = getWarningMessage();

  return (
    <Box style={styles.container}>
      <Typography variant="body2" style={styles.text}>
        {selectedDatasets.size === 0
          ? 'No datasets selected'
          : `${selectedDatasets.size} dataset${selectedDatasets.size !== 1 ? 's' : ''} selected`}
      </Typography>
      <Typography variant="body2" style={styles.text}>
        Total: {isLoading ? 'Calculating...' : totalRows.toLocaleString()} of{' '}
        {maxRows.toLocaleString()} rows
      </Typography>
      <Typography
        variant="body2"
        style={{
          ...styles.warningText,
          color: warningMessage && !isLoading ? warningColor : 'transparent',
          visibility: warningMessage && !isLoading ? 'visible' : 'hidden',
        }}
      >
        {warningMessage || 'Placeholder text for layout consistency'}
      </Typography>
    </Box>
  );
};

export default RowCountTotal;
