import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Chip } from '@material-ui/core';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import { dateToUTCHumanString } from '../../../../../shared/filtering/utils/dateHelpers';

const useStyles = makeStyles((theme) => ({
  summaryContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

/**
 * ConstraintsSummary Component
 *
 * Displays a concise, one-line summary of active search constraints when the
 * constraints section is collapsed. Shows spatial bounds, temporal range (if enabled),
 * depth range (if enabled), and overlap mode.
 *
 * @component
 * @returns {React.Element} A summary view of search constraints
 *
 * @example
 * <ConstraintsSummary />
 */
const ConstraintsSummary = () => {
  const classes = useStyles();

  const spatialBounds = useSpatialTemporalSearchStore(
    (state) => state.spatialBounds,
  );
  const selectedPreset = useSpatialTemporalSearchStore(
    (state) => state.selectedPreset,
  );
  const temporalEnabled = useSpatialTemporalSearchStore(
    (state) => state.temporalEnabled,
  );
  const temporalRange = useSpatialTemporalSearchStore(
    (state) => state.temporalRange,
  );
  const depthEnabled = useSpatialTemporalSearchStore(
    (state) => state.depthEnabled,
  );
  const depthRange = useSpatialTemporalSearchStore((state) => state.depthRange);
  const includePartialOverlaps = useSpatialTemporalSearchStore(
    (state) => state.includePartialOverlaps,
  );

  /**
   * Format latitude range for display
   * @returns {string} Formatted latitude constraint text
   */
  const formatLatitude = () => {
    const { latMin, latMax } = spatialBounds;
    return `Latitude: ${latMax}°N ~ ${latMin}°N`;
  };

  const formatLongitude = () => {
    const { lonMin, lonMax } = spatialBounds;
    const crossesDateline = lonMin > lonMax;

    if (crossesDateline) {
      return `Longitude: ${lonMin}° to ${lonMax}° (crosses dateline)`;
    }
    return `Longitude: ${lonMin}° to ${lonMax}°`;
  };

  /**
   * Format region preset for display
   * @returns {string | null} Formatted preset text or null if no preset selected
   */
  const formatRegion = () => {
    // Only show region if a preset is selected (not null)
    if (!selectedPreset) {
      return null;
    }
    return `Region: ${selectedPreset}`;
  };

  /**
   * Format temporal range for display
   * @returns {string | null} Formatted temporal constraint text or null if disabled
   */
  const formatTemporalRange = () => {
    if (!temporalEnabled || !temporalRange.timeMin || !temporalRange.timeMax) {
      return null;
    }

    return `Time: ${dateToUTCHumanString(temporalRange.timeMin)} ~ ${dateToUTCHumanString(temporalRange.timeMax)}`;
  };

  /**
   * Format depth range for display
   * @returns {string | null} Formatted depth constraint text or null if disabled
   */
  const formatDepthRange = () => {
    if (
      !depthEnabled ||
      depthRange.depthMin === null ||
      depthRange.depthMax === null
    ) {
      return null;
    }

    return `Depth: ${depthRange.depthMin}m ~ ${depthRange.depthMax}m`;
  };

  const regionText = formatRegion();
  const latitudeText = formatLatitude();
  const longitudeText = formatLongitude();
  const temporalText = formatTemporalRange();
  const depthText = formatDepthRange();

  return (
    <div className={classes.summaryContainer}>
      {regionText && (
        <Chip label={regionText} size="small" className={classes.chip} />
      )}
      <Chip label={latitudeText} size="small" className={classes.chip} />
      <Chip label={longitudeText} size="small" className={classes.chip} />
      {temporalText && (
        <Chip label={temporalText} size="small" className={classes.chip} />
      )}
      {depthText && (
        <Chip label={depthText} size="small" className={classes.chip} />
      )}
      {includePartialOverlaps && (
        <Chip
          label="Includes partial overlaps"
          size="small"
          className={classes.chip}
        />
      )}
    </div>
  );
};

export default ConstraintsSummary;
