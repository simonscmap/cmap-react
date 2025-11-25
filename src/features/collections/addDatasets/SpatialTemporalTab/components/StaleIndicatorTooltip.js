import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../../../enums/zIndex';
import logInit from '../../../../../Services/log-service';

const log = logInit('SpatialTemporalTab/StaleIndicatorTooltip');

const useStyles = makeStyles(() => ({
  tooltip: {
    maxWidth: 300,
    backgroundColor: 'rgba(30, 67, 113, 0.95)',
    fontSize: 12,
    padding: 12,
    borderRadius: 4,
    zIndex: zIndex.MODAL_LAYER_2_POPPER, // Ensure tooltip appears above AddDatasetsModal (SECONDARY_MODAL)
  },
  tooltipContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  action: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  button: {
    backgroundColor: '#bbdefb',
    color: '#1565c0',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'none',
    marginTop: 4,
    marginBottom: 4,
    '&:hover': {
      backgroundColor: '#90caf9',
    },
    '&:disabled': {
      backgroundColor: '#e3f2fd',
      color: '#64b5f6',
    },
  },
  footer: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  spinner: {
    marginLeft: 8,
  },
}));

/**
 * Tooltip message templates for different staleness reasons
 * Each reason has two variants:
 * - body: Shown when recalculate button is available
 * - bodyAfterRecalculation: Shown when user has already used "Recalculate All" (button hidden)
 */
const TOOLTIP_MESSAGES = {
  spatial_partial: {
    body: 'This row count may not reflect your current constraints. Click Recalculate to get an accurate count.',
    bodyAfterRecalculation:
      'This row count may not reflect your current constraints. To get accurate counts, you must first perform a new search with your updated constraints, then recalculate.',
  },
  temporal_enabled: {
    body: 'This row count may not reflect your current constraints. Click Recalculate to get an accurate count.',
    bodyAfterRecalculation:
      'This row count may not reflect your current constraints. To get accurate counts, you must first perform a new search with your updated constraints, then recalculate.',
  },
  depth_enabled: {
    body: 'This row count may not reflect your current constraints. Click Recalculate to get an accurate count.',
    bodyAfterRecalculation:
      'This row count may not reflect your current constraints. To get accurate counts, you must first perform a new search with your updated constraints, then recalculate.',
  },
  constraints_changed: {
    body: 'This row count may not reflect your current constraints. Click Recalculate to get an accurate count.',
    bodyAfterRecalculation:
      'This row count may not reflect your current constraints. To get accurate counts, you must first perform a new search with your updated constraints, then recalculate.',
  },
  dataset_not_in_results: {
    body: 'Search results changed - this dataset may no longer match your current constraints. Click Recalculate to confirm this dataset still matches.',
    bodyAfterRecalculation:
      'Search results changed - this dataset may no longer match your current constraints. To get accurate counts, you must first perform a new search with your updated constraints, then recalculate.',
  },
};

/**
 * StaleIndicatorTooltip Component
 *
 * Displays a tooltip with an explanation and optionally an embedded recalculate button
 * when a dataset's row count is stale (does not reflect current constraints).
 *
 * @param {Object} props
 * @param {string} props.reason - Staleness reason ('spatial_partial', 'temporal_enabled', 'depth_enabled', 'constraints_changed', 'dataset_not_in_results')
 * @param {Object} props.dataset - Dataset object with shortName
 * @param {Function} props.onRecalculate - Callback to trigger recalculation for this dataset
 * @param {boolean} props.isRecalculating - Whether recalculation is in progress
 * @param {boolean} props.hasUsedGlobalRecalculation - Whether the user has already used the "Recalculate All" button
 * @param {React.ReactNode} props.children - The warning icon element
 * @returns {JSX.Element}
 */
const StaleIndicatorTooltip = ({
  reason,
  dataset,
  onRecalculate,
  isRecalculating,
  hasUsedGlobalRecalculation,
  children,
}) => {
  const classes = useStyles();
  const message = TOOLTIP_MESSAGES[reason];

  // Fallback for unknown reason
  if (!message) {
    log.warn(
      `StaleIndicatorTooltip: Unknown reason "${reason}" for dataset ${dataset.shortName}`,
      { reason, dataset: dataset.shortName },
    );
    return children;
  }

  const handleRecalculate = (event) => {
    event.stopPropagation();
    event.preventDefault();
    onRecalculate();
  };

  // Select appropriate message based on whether recalculate button is available
  const messageText = hasUsedGlobalRecalculation
    ? message.bodyAfterRecalculation
    : message.body;

  const tooltipContent = (
    <Box className={classes.tooltipContent}>
      <div className={classes.body}>{messageText}</div>
      {/* Only show recalculate button if user hasn't used "Recalculate All" yet */}
      {!hasUsedGlobalRecalculation && (
        <Button
          className={classes.button}
          size="small"
          variant="contained"
          onClick={handleRecalculate}
          disabled={isRecalculating}
          aria-label="Recalculate row count for this dataset"
        >
          {isRecalculating ? (
            <>
              Recalculating...
              <CircularProgress
                size={12}
                className={classes.spinner}
                color="inherit"
              />
            </>
          ) : (
            'Recalculate'
          )}
        </Button>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      classes={{ tooltip: classes.tooltip }}
      placement="top"
      interactive
      aria-describedby={`stale-tooltip-${dataset.shortName}`}
      PopperProps={{
        style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
      }}
    >
      <span aria-label="Warning: Row count may be inaccurate">{children}</span>
    </Tooltip>
  );
};

StaleIndicatorTooltip.propTypes = {
  reason: PropTypes.oneOf([
    'spatial_partial',
    'temporal_enabled',
    'depth_enabled',
    'constraints_changed',
    'dataset_not_in_results',
  ]).isRequired,
  dataset: PropTypes.shape({
    shortName: PropTypes.string.isRequired,
  }).isRequired,
  onRecalculate: PropTypes.func.isRequired,
  isRecalculating: PropTypes.bool.isRequired,
  hasUsedGlobalRecalculation: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default StaleIndicatorTooltip;
