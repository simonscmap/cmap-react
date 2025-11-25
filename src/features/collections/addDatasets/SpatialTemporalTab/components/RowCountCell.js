import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import StaleIndicatorTooltip from './StaleIndicatorTooltip';
import ClusterOnlyTooltip from './SkipReasonTooltip';
import useRowCountCalculationStore from '../store/rowCountCalculationStore';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';

const useStyles = makeStyles((theme) => ({
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
 * Displays row count for a dataset with support for:
 * - Loading state (spinner)
 * - Estimated row count (white number + purple "(estimate)" label)
 * - Recalculated row count (white number + green "(recalculated)" label)
 * - Failed calculation (original count + red "(failed)")
 * - Cluster-only dataset (original count + gray info icon + "(cluster only)" label with tooltip)
 * - Default state (original count from dataset stats)
 *
 * @param {Object} props
 * @param {Object} props.dataset - Dataset object with shortName and rows
 * @param {Object} props.calculatedRowCounts - Map of shortName → calculated count
 * @param {Array} props.failedRowCounts - Array of shortNames that failed calculation
 * @param {Array} props.skippedDatasets - Array of shortNames for cluster-only datasets that were skipped
 * @param {Set} props.rowCountLoadingDatasets - Set of shortNames currently being calculated
 * @returns {JSX.Element}
 */
const RowCountCell = ({
  dataset,
  calculatedRowCounts,
  failedRowCounts,
  skippedDatasets,
  rowCountLoadingDatasets,
}) => {
  const classes = useStyles();
  const shortName = dataset.shortName;

  // Access stores for staleness detection and estimation tracking
  const isDatasetStale = useRowCountCalculationStore(
    (state) => state.isDatasetStale,
  );
  const isDatasetSkipped = useRowCountCalculationStore(
    (state) => state.isDatasetSkipped,
  );
  const calculateRowCountsForDatasets = useRowCountCalculationStore(
    (state) => state.calculateRowCountsForDatasets,
  );
  const buildConstraintsFromStore = useRowCountCalculationStore(
    (state) => state.buildConstraintsFromStore,
  );
  const hasUsedGlobalRecalculation = useRowCountCalculationStore(
    (state) => state.hasUsedGlobalRecalculation,
  );
  const estimatedRowCounts = useRowCountCalculationStore(
    (state) => state.estimatedRowCounts,
  );
  const {
    spatialBounds,
    temporalEnabled,
    temporalRange,
    depthEnabled,
    depthRange,
    includePartialOverlaps,
  } = useSpatialTemporalSearchStore();

  // Build current constraints object
  const currentConstraints = {
    spatialBounds,
    temporalRange,
    depthRange,
    temporalEnabled,
    depthEnabled,
    includePartialOverlaps,
  };

  // Check if dataset is stale
  const { isStale, reason } = isDatasetStale(
    shortName,
    currentConstraints,
    dataset.datasetUtilization || 1.0,
    dataset.type,
  );

  // Callback to recalculate row count for this specific dataset
  const handleRecalculate = () => {
    // Recalculate only this dataset - per-dataset snapshot will be stored automatically
    // Does not consume the global recalculation opportunity (that's only for "Recalculate All")
    const constraints = buildConstraintsFromStore();
    calculateRowCountsForDatasets([dataset], constraints);
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
            hasUsedGlobalRecalculation={hasUsedGlobalRecalculation}
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
        ) : (
          // Show estimate or recalculated label (calculation still valid)
          <>
            <br />
            {estimatedRowCounts.has(shortName) ? (
              <span className={classes.estimatedRowCount}>(estimate)</span>
            ) : (
              <span className={classes.recalculatedRowCount}>(recalculated)</span>
            )}
          </>
        )}
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
        <br />
        <span className={classes.clusterOnlyRowCount}>(cluster only)</span>
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
          hasUsedGlobalRecalculation={hasUsedGlobalRecalculation}
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
  calculatedRowCounts: PropTypes.object.isRequired,
  failedRowCounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  skippedDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  rowCountLoadingDatasets: PropTypes.instanceOf(Set).isRequired,
};

export default RowCountCell;
