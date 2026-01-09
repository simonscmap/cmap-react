/**
 * CompactSubsetControlsLayout - Compact layout for subset filtering controls
 *
 * Implements Layer 5 of filtering subsystem (layout component).
 * Receives normalized control props from SubsetControls (Layer 4) and renders
 * compact input components.
 *
 * Features:
 * - Horizontal compact layout for all controls
 * - Conditional rendering for monthly climatology vs. standard date range
 * - Proper prop forwarding from SubsetControls contract
 * - Drop-in replacement for DefaultSubsetControlsLayout
 *
 * @module CompactSubsetControlsLayout
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Collapse, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CompactDateRangeInput from './compact/CompactDateRangeInput';
import CompactLatitudeInput from './compact/CompactLatitudeInput';
import CompactLongitudeInput from './compact/CompactLongitudeInput';
import CompactDepthInput from './compact/CompactDepthInput';
import CompactPresetGeographicBounds from './compact/CompactPresetGeographicBounds';
import MonthlyDateSubsetControl from './controls/MonthlyDateSubsetControl';
import ToggleWithHelp from '../../components/ToggleWithHelp';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  subsetStep: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(2),
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  sectionDivider: {
    margin: theme.spacing(2, 0),
    backgroundColor: theme.palette.divider,
  },
  temporalDepthRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20%',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(3),
    },
    '& > *': {
      flex: '0 0 40%',
      [theme.breakpoints.down('sm')]: {
        flex: '1 1 100%',
      },
    },
  },
  geographicSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  geographicSectionTitle: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: theme.spacing(2),
  },
  presetRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20%',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(3),
    },
    '& > *': {
      flex: '0 0 40%',
      [theme.breakpoints.down('sm')]: {
        flex: '1 1 100%',
      },
    },
  },
  geographicGrid: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20%',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(3),
    },
    '& > *': {
      flex: '0 0 40%',
      [theme.breakpoints.down('sm')]: {
        flex: '1 1 100%',
      },
    },
  },
  infoText: {
    color: '#fdd835',
    fontSize: '0.75rem',
  },
}));

/**
 * CompactSubsetControlsLayout component
 *
 * Renders compact subset controls that integrate with the filtering subsystem.
 * Receives control configuration from SubsetControls parent component.
 * Drop-in replacement for DefaultSubsetControlsLayout.
 *
 * @param {Object} props
 * @param {Object} props.controls - Control configuration from SubsetControls (passed via React.cloneElement)
 * @param {Object} props.optionsState - Toggle state from parent (e.g., { subset: true })
 * @param {Function} props.handleSwitch - Toggle handler from parent
 * @returns {JSX.Element}
 */
const CompactSubsetControlsLayout = ({
  optionsState,
  handleSwitch,
  controls = {}, // Default to empty object to prevent destructuring errors
}) => {
  const classes = useStyles();

  const { date, latitude, longitude, depth } = controls;

  return (
    <React.Fragment>
      <ToggleWithHelp
        downloadOption={{
          handler: handleSwitch,
          switchState: optionsState.subset,
          name: 'subset',
          label: 'Define Subset',
        }}
        description="Define a subset of the data for download by specifying time, lat, lon, and depth parameters."
      />

      <Collapse in={optionsState.subset}>
        <Box className={classes.subsetStep}>
          {/* Temporal and Depth Bounds Row */}
          <Box className={classes.temporalDepthRow}>
            {/* Temporal Bounds */}
            {date.data.isMonthlyClimatology ? (
              <MonthlyDateSubsetControl
                subsetState={{
                  timeStart: date.data.timeStart,
                  timeEnd: date.data.timeEnd,
                }}
                setTimeStart={date.handlers.setTimeStart}
                setTimeEnd={date.handlers.setTimeEnd}
              />
            ) : (
              <CompactDateRangeInput
                title="Date"
                startDate={date.data.timeStart}
                endDate={date.data.timeEnd}
                setStartDate={date.handlers.setTimeStart}
                setEndDate={date.handlers.setTimeEnd}
                minDate={date.data.timeMin}
                maxDate={date.data.timeMax}
                setInvalidFlag={date.setInvalidFlag}
              />
            )}

            {/* Depth Bounds */}
            <CompactDepthInput
              title="Depth [m]"
              start={depth.data.depthStart}
              end={depth.data.depthEnd}
              setStart={depth.handlers.setDepthStart}
              setEnd={depth.handlers.setDepthEnd}
              min={depth.data.depthMin}
              max={depth.data.depthMax}
              step={0.1}
              unit="m"
            />
          </Box>

          {/* Geographic Bounds Section */}
          <Box className={classes.geographicSection}>
            <Typography
              variant="body2"
              className={classes.geographicSectionTitle}
            >
              GEOGRAPHIC BOUNDS
            </Typography>

            <Box className={classes.presetRow}>
              <CompactPresetGeographicBounds
                currentBounds={{
                  latStart: latitude.data.latStart,
                  latEnd: latitude.data.latEnd,
                  lonStart: longitude.data.lonStart,
                  lonEnd: longitude.data.lonEnd,
                }}
                onPresetApply={(bounds) => {
                  latitude.handlers.setLatStart(bounds.latStart);
                  latitude.handlers.setLatEnd(bounds.latEnd);
                  longitude.handlers.setLonStart(bounds.lonStart);
                  longitude.handlers.setLonEnd(bounds.lonEnd);
                }}
              />
              <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
                {longitude.data.lonStart > longitude.data.lonEnd && (
                  <Typography variant="caption" className={classes.infoText}>
                    The selected longitude values cross the dateline (antimeridian).
                  </Typography>
                )}
              </Box>
            </Box>

            <Box className={classes.geographicGrid}>
              <CompactLatitudeInput
                title="Latitude [°]"
                start={latitude.data.latStart}
                end={latitude.data.latEnd}
                setStart={latitude.handlers.setLatStart}
                setEnd={latitude.handlers.setLatEnd}
                min={latitude.data.latMin}
                max={latitude.data.latMax}
                step={0.1}
                unit="°"
              />

              <CompactLongitudeInput
                title="Longitude [°]"
                start={longitude.data.lonStart}
                end={longitude.data.lonEnd}
                setStart={longitude.handlers.setLonStart}
                setEnd={longitude.handlers.setLonEnd}
                min={longitude.data.lonMin}
                max={longitude.data.lonMax}
                step={0.1}
                unit="°"
              />
            </Box>
          </Box>
        </Box>
      </Collapse>
    </React.Fragment>
  );
};

CompactSubsetControlsLayout.propTypes = {
  optionsState: PropTypes.shape({
    subset: PropTypes.bool.isRequired,
  }).isRequired,
  handleSwitch: PropTypes.func.isRequired,
  // Controls prop is provided at runtime via React.cloneElement by SubsetControls
  // Marking as optional to prevent PropTypes warning during initial render
  controls: PropTypes.shape({
    date: PropTypes.shape({
      data: PropTypes.shape({
        timeStart: PropTypes.instanceOf(Date).isRequired,
        timeEnd: PropTypes.instanceOf(Date).isRequired,
        timeMin: PropTypes.instanceOf(Date).isRequired,
        timeMax: PropTypes.instanceOf(Date).isRequired,
        isMonthlyClimatology: PropTypes.bool.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setTimeStart: PropTypes.func.isRequired,
        setTimeEnd: PropTypes.func.isRequired,
        handleSetStartDate: PropTypes.func.isRequired,
        handleSetEndDate: PropTypes.func.isRequired,
      }).isRequired,
      setInvalidFlag: PropTypes.func.isRequired,
    }).isRequired,
    latitude: PropTypes.shape({
      data: PropTypes.shape({
        latStart: PropTypes.number.isRequired,
        latEnd: PropTypes.number.isRequired,
        latMin: PropTypes.number.isRequired,
        latMax: PropTypes.number.isRequired,
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
        lonMin: PropTypes.number.isRequired,
        lonMax: PropTypes.number.isRequired,
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
        depthMin: PropTypes.number.isRequired,
        depthMax: PropTypes.number.isRequired,
      }).isRequired,
      handlers: PropTypes.shape({
        setDepthStart: PropTypes.func.isRequired,
        setDepthEnd: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }), // Not marked as .isRequired since it's provided via React.cloneElement
};

export default CompactSubsetControlsLayout;
