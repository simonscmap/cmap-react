import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../enums/zIndex';
import logInit from '../../../Services/log-service';

var log = logInit('features/rowCounts/components/StaleIndicatorTooltip');

var useStyles = makeStyles(function () {
  return {
    tooltip: {
      maxWidth: 300,
      backgroundColor: 'rgba(30, 67, 113, 0.95)',
      fontSize: 12,
      padding: 12,
      borderRadius: 4,
      zIndex: zIndex.MODAL_LAYER_2_POPPER,
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
  };
});

var TOOLTIP_MESSAGES = {
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

function StaleIndicatorTooltip(props) {
  var reason = props.reason;
  var dataset = props.dataset;
  var onRecalculate = props.onRecalculate;
  var isRecalculating = props.isRecalculating;
  var hasUsedGlobalRecalculation = props.hasUsedGlobalRecalculation;
  var children = props.children;

  var classes = useStyles();
  var message = TOOLTIP_MESSAGES[reason];

  if (!message) {
    log.warn(
      'StaleIndicatorTooltip: Unknown reason "' +
        reason +
        '" for dataset ' +
        dataset.shortName,
      { reason: reason, dataset: dataset.shortName },
    );
    return children;
  }

  var handleRecalculate = function (event) {
    event.stopPropagation();
    event.preventDefault();
    onRecalculate();
  };

  var messageText = hasUsedGlobalRecalculation
    ? message.bodyAfterRecalculation
    : message.body;

  var tooltipContent = (
    <Box className={classes.tooltipContent}>
      <div className={classes.body}>{messageText}</div>
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
      aria-describedby={'stale-tooltip-' + dataset.shortName}
      PopperProps={{
        style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
      }}
    >
      <span aria-label="Warning: Row count may be inaccurate">{children}</span>
    </Tooltip>
  );
}

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
