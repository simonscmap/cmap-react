import React from 'react';
import { Typography, Box } from '@material-ui/core';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';

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
  const { selectedDatasets } = useMultiDatasetDownloadStore();
  const { getThresholdStatus } = useRowCountStore();

  const thresholdStatus = getThresholdStatus(selectedDatasets);
  const { totalRows, maxRows, isLoading, isOverThreshold } = thresholdStatus;

  const getWarningColor = () => {
    if (isOverThreshold) return '#f44336'; // Red
    return null;
  };

  const getWarningMessage = () => {
    if (isOverThreshold) {
      const excessRows = totalRows - maxRows;
      return `Selection exceeds limit by ${excessRows.toLocaleString()} rows`;
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
