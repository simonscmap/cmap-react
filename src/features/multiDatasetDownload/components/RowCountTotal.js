import React from 'react';
import { Typography, Box } from '@material-ui/core';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';

const styles = {
  container: {
    minHeight: 48, // Prevent layout shift - increased for potential warning text
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
  const {
    totalRows,
    maxRows,
    isLoading,
    isOverThreshold,
    isApproachingThreshold,
  } = thresholdStatus;

  const getWarningColor = () => {
    if (isOverThreshold) return '#f44336'; // Red
    if (isApproachingThreshold) return '#ff9800'; // Orange
    return null;
  };

  const getWarningMessage = () => {
    if (isOverThreshold) {
      const excessRows = totalRows - maxRows;
      return `Selection exceeds limit by ${excessRows.toLocaleString()} rows`;
    }
    if (isApproachingThreshold) {
      return 'Approaching row count limit';
    }
    return null;
  };

  const warningColor = getWarningColor();
  const warningMessage = getWarningMessage();

  return (
    <Box style={styles.container}>
      <Typography variant="body2" style={styles.text}>
        Total: {isLoading ? 'Calculating...' : totalRows.toLocaleString()} of{' '}
        {maxRows.toLocaleString()} rows
      </Typography>
      {warningMessage && !isLoading && (
        <Typography
          variant="body2"
          style={{
            ...styles.warningText,
            color: warningColor,
          }}
        >
          {warningMessage}
        </Typography>
      )}
    </Box>
  );
};

export default RowCountTotal;
