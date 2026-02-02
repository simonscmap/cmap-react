import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RestoreIcon from '@material-ui/icons/Restore';
import UniversalButton from '../../../components/UniversalButton';
import zIndex from '../../../../enums/zIndex';
import colors from '../../../../enums/colors';
import { dateToUTCDateString } from '../../utils/dateHelpers';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  tooltipRow: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  tooltipLabel: {
    fontWeight: 'bold',
    minWidth: 75,
    color: colors.secondary,
  },
  tooltipValue: {
    textAlign: 'left',
  },
}));

const formatDate = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

const EPSILON = 0.0001;

const isAtCollectionExtent = (controls, collectionExtent) => {
  if (!collectionExtent || !controls.latitude || !controls.longitude) return true;

  const { latitude, longitude, date, depth } = controls;
  const isMonthlyClimatology = date.data.isMonthlyClimatology;

  const numMatch = (a, b) => {
    if (a == null || b == null) return a == null && b == null;
    return Math.abs(a - b) < EPSILON;
  };

  const dateMatch = (a, b) => {
    if (!a || !b) return !a && !b;
    return dateToUTCDateString(a) === dateToUTCDateString(b);
  };

  const geoMatch = (
    numMatch(latitude.data.latStart, collectionExtent.latMin) &&
    numMatch(latitude.data.latEnd, collectionExtent.latMax) &&
    numMatch(longitude.data.lonStart, collectionExtent.lonMin) &&
    numMatch(longitude.data.lonEnd, collectionExtent.lonMax)
  );

  const depthMatch = (
    numMatch(depth.data.depthStart, collectionExtent.depthMin) &&
    numMatch(depth.data.depthEnd, collectionExtent.depthMax)
  );

  const timeMatch = isMonthlyClimatology || (
    dateMatch(date.data.timeStart, collectionExtent.timeMin) &&
    dateMatch(date.data.timeEnd, collectionExtent.timeMax)
  );

  return geoMatch && depthMatch && timeMatch;
};

const ResetToCollectionExtentButton = ({
  controls,
  collectionExtent,
  onResetPreset,
  setSliderEndpoints,
  setSliderMessage,
}) => {
  const classes = useStyles();

  if (!controls || !controls.date || !controls.latitude || !controls.longitude || !controls.depth) {
    return null;
  }

  const { date, latitude, longitude, depth } = controls;

  const handleResetToCollectionExtent = () => {
    if (!collectionExtent) return;

    const isMonthlyClimatology = date.data.isMonthlyClimatology;

    if (setSliderEndpoints) {
      setSliderEndpoints({
        latMin: collectionExtent.latMin,
        latMax: collectionExtent.latMax,
        lonMin: collectionExtent.lonMin,
        lonMax: collectionExtent.lonMax,
        depthMin: collectionExtent.depthMin,
        depthMax: collectionExtent.depthMax,
        timeMin: collectionExtent.timeMin,
        timeMax: collectionExtent.timeMax,
      });
    }

    latitude.handlers.setLatStart(collectionExtent.latMin);
    latitude.handlers.setLatEnd(collectionExtent.latMax);
    longitude.handlers.setLonStart(collectionExtent.lonMin);
    longitude.handlers.setLonEnd(collectionExtent.lonMax);

    if (!isMonthlyClimatology && collectionExtent.timeMin && collectionExtent.timeMax) {
      date.handlers.setTimeStart(collectionExtent.timeMin);
      date.handlers.setTimeEnd(collectionExtent.timeMax);
    }

    depth.handlers.setDepthStart(collectionExtent.depthMin);
    depth.handlers.setDepthEnd(collectionExtent.depthMax);

    if (onResetPreset) {
      onResetPreset();
    }

    if (setSliderMessage) {
      setSliderMessage('Restored to collection extent');
    }
  };

  const isDisabled = isAtCollectionExtent(controls, collectionExtent);

  const renderTooltipContent = () => {
    if (!collectionExtent) return 'Reset all filters';

    const hasTemporalBounds = collectionExtent.timeMin && collectionExtent.timeMax;

    return (
      <Box>
        <Typography variant="caption" style={{ fontWeight: 'bold', marginBottom: 4, display: 'block' }}>
          Reset to Collection Extent:
        </Typography>
        {hasTemporalBounds && (
          <Box className={classes.tooltipRow}>
            <span className={classes.tooltipLabel}>Temporal:</span>
            <span className={classes.tooltipValue}>
              {formatDate(collectionExtent.timeMin)} to {formatDate(collectionExtent.timeMax)}
            </span>
          </Box>
        )}
        <Box className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>Latitude:</span>
          <span className={classes.tooltipValue}>
            {collectionExtent.latMin.toFixed(1)}° to {collectionExtent.latMax.toFixed(1)}°
          </span>
        </Box>
        <Box className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>Longitude:</span>
          <span className={classes.tooltipValue}>
            {collectionExtent.lonMin.toFixed(1)}° to {collectionExtent.lonMax.toFixed(1)}°
          </span>
        </Box>
        <Box className={classes.tooltipRow}>
          <span className={classes.tooltipLabel}>Depth:</span>
          <span className={classes.tooltipValue}>
            {collectionExtent.depthMin}m to {collectionExtent.depthMax}m
          </span>
        </Box>
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <Tooltip
        title={renderTooltipContent()}
        placement="right"
        PopperProps={{ style: { zIndex: zIndex.MODAL_LAYER_2_POPPER } }}
      >
        <span>
          <UniversalButton
            variant="primary"
            size="small"
            onClick={handleResetToCollectionExtent}
            disabled={isDisabled}
            startIcon={<RestoreIcon />}
          >
            Reset to Collection Extent
          </UniversalButton>
        </span>
      </Tooltip>
    </Box>
  );
};

ResetToCollectionExtentButton.propTypes = {
  controls: PropTypes.shape({
    date: PropTypes.shape({
      data: PropTypes.shape({
        timeStart: PropTypes.instanceOf(Date).isRequired,
        timeEnd: PropTypes.instanceOf(Date).isRequired,
        isMonthlyClimatology: PropTypes.bool.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setTimeStart: PropTypes.func.isRequired,
        setTimeEnd: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    latitude: PropTypes.shape({
      data: PropTypes.shape({
        latStart: PropTypes.number.isRequired,
        latEnd: PropTypes.number.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setLatStart: PropTypes.func.isRequired,
        setLatEnd: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    longitude: PropTypes.shape({
      data: PropTypes.shape({
        lonStart: PropTypes.number.isRequired,
        lonEnd: PropTypes.number.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setLonStart: PropTypes.func.isRequired,
        setLonEnd: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    depth: PropTypes.shape({
      data: PropTypes.shape({
        depthStart: PropTypes.number.isRequired,
        depthEnd: PropTypes.number.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setDepthStart: PropTypes.func.isRequired,
        setDepthEnd: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }),
  collectionExtent: PropTypes.shape({
    latMin: PropTypes.number.isRequired,
    latMax: PropTypes.number.isRequired,
    lonMin: PropTypes.number.isRequired,
    lonMax: PropTypes.number.isRequired,
    timeMin: PropTypes.instanceOf(Date),
    timeMax: PropTypes.instanceOf(Date),
    depthMin: PropTypes.number,
    depthMax: PropTypes.number,
  }),
  onResetPreset: PropTypes.func,
  setSliderEndpoints: PropTypes.func,
  setSliderMessage: PropTypes.func,
};

export default ResetToCollectionExtentButton;
