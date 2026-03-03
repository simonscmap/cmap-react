import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../enums/zIndex';
import logInit from '../../../Services/log-service';
import { queryRowCountsForDatasets } from '../../rowCount/state/rowCountCalculationStore';
import { transformConstraintsForRowCount } from '../utils/constraintTransformer';

const log = logInit('multiDatasetDownload/BatchStaleIndicatorTooltip');

const useStyles = makeStyles(() => ({
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
  body: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  error: {
    fontSize: 11,
    color: '#ff8a80',
    marginTop: 4,
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
  spinner: {
    marginLeft: 8,
  },
}));

const BatchStaleIndicatorTooltip = ({
  staleDatasets,
  filterValues,
  children,
}) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const staleCount = staleDatasets.length;

  const handleRecalculate = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const constraints = transformConstraintsForRowCount(filterValues);
      const datasets = staleDatasets.map((shortName) => ({ shortName }));
      await queryRowCountsForDatasets(datasets, constraints);
    } catch (err) {
      setError('Failed to recalculate. Please try again.');
      log.error('Batch recalculation failed', { error: err, staleDatasets });
    } finally {
      setIsLoading(false);
    }
  };

  const message =
    'Some selected datasets have row counts that may not reflect your current constraints.';

  const buttonText = isLoading
    ? 'Recalculating...'
    : `Recalculate ${staleCount} Stale Dataset${staleCount === 1 ? '' : 's'}`;

  const tooltipContent = (
    <Box className={classes.tooltipContent}>
      <div className={classes.body}>{message}</div>
      <Button
        className={classes.button}
        size="small"
        variant="contained"
        onClick={handleRecalculate}
        disabled={isLoading}
        aria-label={`Recalculate ${staleCount} stale datasets`}
      >
        {buttonText}
        {isLoading && (
          <CircularProgress
            size={12}
            className={classes.spinner}
            color="inherit"
          />
        )}
      </Button>
      {error && <div className={classes.error}>{error}</div>}
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      classes={{ tooltip: classes.tooltip }}
      placement="top"
      interactive
      aria-describedby="batch-stale-tooltip"
      PopperProps={{
        style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
      }}
    >
      <span aria-label="Warning: Some row counts may be inaccurate">
        {children}
      </span>
    </Tooltip>
  );
};

BatchStaleIndicatorTooltip.propTypes = {
  staleDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  filterValues: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default BatchStaleIndicatorTooltip;
