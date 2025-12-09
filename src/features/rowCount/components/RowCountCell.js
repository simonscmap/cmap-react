import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import StaleIndicatorTooltip from './StaleIndicatorTooltip';
import ClusterOnlyTooltip from './SkipReasonTooltip';
import {
  useCalculatedRowCounts,
  useRowCountLoadingDatasets,
  useFailedRowCounts,
  isDatasetStale,
  isDatasetSkipped,
  calculateRowCountsForDatasets,
} from '../state/rowCountCalculationStore';

const useStyles = makeStyles(() => ({
  rowCountLoading: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  failedRowCount: {
    color: '#c62828', // Prominent red (matching private chip pattern)
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  clusterOnlyRowCount: {
    color: '#90a4ae', // Gray/blue for cluster-only
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  recalculatedRowCount: {
    color: '#8bc34a', // Vibrant green
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  estimatedRowCount: {
    color: '#9c27b0', // Purple (Material-UI primary purple)
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
}));

/**
 * RowCountCell Component
 *
 * Self-contained component that displays row count for a dataset.
 * Uses hooks internally to access row count state.
 *
 * Supports:
 * - Loading state (spinner)
 * - Estimated row count
 * - Recalculated row count
 * - Failed calculation (original count + red "(failed)")
 * - Cluster-only dataset (original count + gray info icon with tooltip)
 * - Stale indicator (yellow warning icon with tooltip)
 * - Default state (original count from dataset stats)
 *
 * @param {Object} props
 * @param {Object} props.dataset - Dataset object with shortName and rows
 * @param {Object} props.currentConstraints - Current constraint configuration
 * @returns {JSX.Element}
 */
const RowCountCell = ({ dataset, currentConstraints }) => {
  const classes = useStyles();
  const shortName = dataset.shortName;

  // Access store state via hooks (self-contained)
  const calculatedRowCounts = useCalculatedRowCounts();
  const rowCountLoadingDatasets = useRowCountLoadingDatasets();
  const failedRowCounts = useFailedRowCounts();

  // Check if dataset is stale (action called directly)
  const { isStale, reason } = isDatasetStale(
    shortName,
    currentConstraints,
    dataset.datasetUtilization || 1.0,
  );

  // Callback to recalculate row count for this specific dataset
  const handleRecalculate = () => {
    // Recalculate only this dataset - per-dataset snapshot will be stored automatically
    // Does not consume the global recalculation opportunity (that's only for "Recalculate All")
    calculateRowCountsForDatasets([dataset], currentConstraints);
  };

  // Check if this dataset is currently being calculated
  if (rowCountLoadingDatasets.has(shortName)) {
    return (
      <Box className={classes.rowCountLoading}>
        <CircularProgress size={16} color="primary" />
      </Box>
    );
  }

  // Check if this dataset has a calculated row count
  if (calculatedRowCounts[shortName] !== undefined) {
    return (
      <span>
        {calculatedRowCounts[shortName].toLocaleString()}
        {isStale ? (
          // Show stale warning icon (most recent state)
          <StaleIndicatorTooltip
            reason={reason}
            dataset={dataset}
            onRecalculate={handleRecalculate}
            isRecalculating={rowCountLoadingDatasets.has(shortName)}
          >
            <WarningIcon
              style={{
                color: '#fdd835',
                fontSize: 16,
                verticalAlign: 'middle',
                marginLeft: 4,
              }}
            />
          </StaleIndicatorTooltip>
        ) : null}
      </span>
    );
  }

  // Check if this dataset failed calculation
  if (failedRowCounts.includes(shortName)) {
    return (
      <span>
        {typeof dataset.rows === 'number'
          ? dataset.rows.toLocaleString()
          : 'N/A'}
        <br />
        <span className={classes.failedRowCount}>(failed)</span>
      </span>
    );
  }

  // Check if this dataset was skipped (cluster-only)
  if (isDatasetSkipped(shortName)) {
    return (
      <span>
        {typeof dataset.rows === 'number'
          ? dataset.rows.toLocaleString()
          : 'N/A'}
        <ClusterOnlyTooltip dataset={dataset}>
          <InfoIcon
            style={{
              color: '#90a4ae',
              fontSize: 16,
              verticalAlign: 'middle',
              marginLeft: 4,
            }}
          />
        </ClusterOnlyTooltip>
      </span>
    );
  }

  // Default: show original row count from stats
  return (
    <span>
      {typeof dataset.rows === 'number' ? dataset.rows.toLocaleString() : 'N/A'}
      {isStale && (
        <StaleIndicatorTooltip
          reason={reason}
          dataset={dataset}
          onRecalculate={handleRecalculate}
          isRecalculating={rowCountLoadingDatasets.has(shortName)}
        >
          <WarningIcon
            style={{
              color: '#fdd835',
              fontSize: 16,
              verticalAlign: 'middle',
              marginLeft: 4,
            }}
          />
        </StaleIndicatorTooltip>
      )}
    </span>
  );
};

RowCountCell.propTypes = {
  dataset: PropTypes.shape({
    shortName: PropTypes.string.isRequired,
    rows: PropTypes.number,
    datasetUtilization: PropTypes.number, // Spatial coverage metric (0.0 to 1.0)
  }).isRequired,
  currentConstraints: PropTypes.shape({
    spatialBounds: PropTypes.object,
    temporalRange: PropTypes.object,
    depthRange: PropTypes.object,
    temporalEnabled: PropTypes.bool,
    depthEnabled: PropTypes.bool,
    includePartialOverlaps: PropTypes.bool,
  }).isRequired,
};

export default RowCountCell;
