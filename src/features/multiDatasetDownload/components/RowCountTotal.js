import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Box } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import { useDownloadThreshold } from '../stores/useDownloadThreshold';
import BatchStaleIndicatorTooltip from './BatchStaleIndicatorTooltip';
import temporalResolutions from '../../../enums/temporalResolutions';
import colors from '../../../enums/colors';

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
  rowCountLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  staleIcon: {
    color: '#fdd835',
    fontSize: 18,
    cursor: 'pointer',
  },
  warningText: {
    fontSize: '0.75rem',
    marginTop: 4,
    fontWeight: 500,
  },
};

const RowCountTotal = ({ filterValues }) => {
  const { selectedDatasets, datasetsMetadata } = useMultiDatasetDownloadStore();
  const {
    totalRows,
    maxRows,
    isLoading,
    isOverThreshold,
    selectedStaleDatasets,
  } = useDownloadThreshold(selectedDatasets);

  const hasStaleSelected =
    selectedStaleDatasets && selectedStaleDatasets.length > 0;

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
    if (isOverThreshold) return colors.blockingError;
    if (hasMonthlyClimatology) return colors.nonBlockingInfo;
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
      return '';
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
      <Box style={styles.rowCountLine}>
        <Typography variant="body2" style={styles.text}>
          Total: {isLoading ? 'Calculating...' : totalRows.toLocaleString()} of{' '}
          {maxRows.toLocaleString()} rows
        </Typography>
        {hasStaleSelected && !isLoading && (
          <BatchStaleIndicatorTooltip
            staleDatasets={selectedStaleDatasets}
            filterValues={filterValues}
          >
            <WarningIcon style={styles.staleIcon} />
          </BatchStaleIndicatorTooltip>
        )}
      </Box>
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

RowCountTotal.propTypes = {
  filterValues: PropTypes.object,
};

RowCountTotal.defaultProps = {
  filterValues: null,
};

export default RowCountTotal;
