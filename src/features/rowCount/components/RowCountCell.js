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
  useOriginalRowCounts,
  useRowCountLoadingDatasets,
  useFailedRowCounts,
  isDatasetStale,
  isDatasetSkipped,
  queryRowCountsForDatasets,
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
 * @param {string} props.shortName - Dataset short name
 * @param {Object} props.currentConstraints - Current constraint configuration
 * @returns {JSX.Element}
 */
const RowCountCell = ({ shortName, currentConstraints }) => {
  const classes = useStyles();

  // Access store state via hooks (self-contained)
  const calculatedRowCounts = useCalculatedRowCounts();
  const originalRowCounts = useOriginalRowCounts();
  const rowCountLoadingDatasets = useRowCountLoadingDatasets();
  const failedRowCounts = useFailedRowCounts();

  const originalRowCount = originalRowCounts[shortName];

  // Check if dataset is stale (action called directly)
  const { isStale, reason } = isDatasetStale(shortName, currentConstraints);

  // Callback to recalculate row count for this specific dataset
  // Recalculate only this dataset - per-dataset snapshot will be stored automatically
  // Does not consume the global recalculation opportunity (that's only for "Recalculate All")
  const handleRecalculate = () => {
    queryRowCountsForDatasets([{ shortName }], currentConstraints);
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
            shortName={shortName}
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
        {typeof originalRowCount === 'number'
          ? originalRowCount.toLocaleString()
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
        {typeof originalRowCount === 'number'
          ? originalRowCount.toLocaleString()
          : 'N/A'}
        <ClusterOnlyTooltip shortName={shortName}>
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
      {typeof originalRowCount === 'number'
        ? originalRowCount.toLocaleString()
        : 'N/A'}
      {isStale && (
        <StaleIndicatorTooltip
          reason={reason}
          shortName={shortName}
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
  shortName: PropTypes.string.isRequired,
  currentConstraints: PropTypes.shape({
    spatialBounds: PropTypes.object,
    temporalRange: PropTypes.object,
    depthRange: PropTypes.object,
    temporalEnabled: PropTypes.bool,
    depthEnabled: PropTypes.bool,
    includePartialOverlaps: PropTypes.bool,
  }),
};

export default RowCountCell;
