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
  getEffectiveRowCount,
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

  const displayCount = getEffectiveRowCount(shortName, calculatedRowCounts, originalRowCounts);
  const displayValue = typeof displayCount === 'number' ? displayCount.toLocaleString() : 'N/A';

  const { isStale, reason } = isDatasetStale(shortName, currentConstraints);

  const handleRecalculate = () => {
    queryRowCountsForDatasets([{ shortName }], currentConstraints);
  };

  if (rowCountLoadingDatasets.has(shortName)) {
    return (
      <Box className={classes.rowCountLoading}>
        <CircularProgress size={16} color="primary" />
      </Box>
    );
  }

  if (failedRowCounts.includes(shortName) && calculatedRowCounts[shortName] === undefined) {
    return (
      <span>
        {displayValue}
        <br />
        <span className={classes.failedRowCount}>(failed)</span>
      </span>
    );
  }

  if (isDatasetSkipped(shortName)) {
    return (
      <span>
        {displayValue}
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

  return (
    <span>
      {displayValue}
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
