import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../enums/zIndex';
import logInit from '../../../Services/log-service';

const log = logInit('rowCount/SkipReasonTooltip');

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
  body: {
    fontSize: 12,
    lineHeight: 1.5,
  },
}));

/**
 * ClusterOnlyTooltip Component
 *
 * Displays a tooltip explaining that a dataset is currently unavailable for constrained queries.
 *
 * @param {Object} props
 * @param {Object} props.dataset - Dataset object with shortName
 * @param {React.ReactNode} props.children - The indicator element (text/icon)
 * @returns {JSX.Element}
 */
const ClusterOnlyTooltip = ({ dataset, children }) => {
  const classes = useStyles();

  const tooltipContent = (
    <Box className={classes.tooltipContent}>
      <div className={classes.body}>
        This dataset is currently unavailable for download with spatial,
        temporal, or depth constraints due to its large size.
      </div>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      classes={{ tooltip: classes.tooltip }}
      placement="top"
      interactive
      aria-describedby={`cluster-only-tooltip-${dataset.shortName}`}
      PopperProps={{
        style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
      }}
    >
      <span aria-label="Dataset unavailable for constrained queries">
        {children}
      </span>
    </Tooltip>
  );
};

ClusterOnlyTooltip.propTypes = {
  dataset: PropTypes.shape({
    shortName: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default ClusterOnlyTooltip;
