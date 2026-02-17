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

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Collapse, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CompactDateRangeInput from './compact/CompactDateRangeInput';
import CompactLatitudeInput from './compact/CompactLatitudeInput';
import CompactLongitudeInput from './compact/CompactLongitudeInput';
import CompactDepthInput from './compact/CompactDepthInput';
import CompactPresetGeographicBounds from './compact/CompactPresetGeographicBounds';
import SliderStatusMessage from './compact/SliderStatusMessage';
import MonthlyDateSubsetControl from './controls/MonthlyDateSubsetControl';
import ToggleWithHelp from '../../components/ToggleWithHelp';
import { FIELD_TYPES } from '../utils/endpointFields';

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
  controls = {},
  geographicPresets,
  collectionExtent,
  selectedPreset,
  onPresetSelect,
  wrappedGeoHandlers,
  sliderEndpoints,
  sliderMessage,
  onExpandEndpoint,
  onSubsetValidationChange,
  onGeoLocalChange,
}) => {
  const classes = useStyles();

  const { date, latitude, longitude, depth } = controls;

  const [latValid, setLatValid] = useState(true);
  const [lonValid, setLonValid] = useState(true);
  const [depthValid, setDepthValid] = useState(true);
  const [dateInvalid, setDateInvalid] = useState(false);

  const isSubsetValid = latValid && lonValid && depthValid && !dateInvalid;

  useEffect(() => {
    if (onSubsetValidationChange) {
      onSubsetValidationChange(isSubsetValid);
    }
  }, [isSubsetValid, onSubsetValidationChange]);

  const handleLatValidation = useCallback((valid) => {
    setLatValid(valid);
  }, []);

  const handleLonValidation = useCallback((valid) => {
    setLonValid(valid);
  }, []);

  const handleDepthValidation = useCallback((valid) => {
    setDepthValid(valid);
  }, []);

  const handleDateInvalidFlag = useCallback((invalid) => {
    setDateInvalid(invalid);
  }, []);

  const handleGeoLocalChange = useCallback(() => {
    if (onGeoLocalChange) {
      onGeoLocalChange();
    }
  }, [onGeoLocalChange]);

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
                setInvalidFlag={handleDateInvalidFlag}
              />
            )}

            {/* Depth Bounds */}
            <CompactDepthInput
              start={depth.data.depthStart}
              end={depth.data.depthEnd}
              setStart={depth.handlers.setDepthStart}
              setEnd={depth.handlers.setDepthEnd}
              min={sliderEndpoints ? sliderEndpoints.depthMin : depth.data.depthMin}
              max={sliderEndpoints ? sliderEndpoints.depthMax : depth.data.depthMax}
              step={0.1}
              onExpandEndpoint={onExpandEndpoint ? function (fieldName, value) { onExpandEndpoint(FIELD_TYPES.DEPTH, fieldName, value); } : null}
              onValidationChange={handleDepthValidation}
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
                selectedPreset={selectedPreset}
                onPresetSelect={onPresetSelect}
                geographicPresets={geographicPresets}
                collectionExtent={collectionExtent}
              />
            </Box>

            <SliderStatusMessage message={sliderMessage} />

            <Box className={classes.geographicGrid}>
              <CompactLatitudeInput
                start={latitude.data.latStart}
                end={latitude.data.latEnd}
                setStart={wrappedGeoHandlers.latitude.setLatStart}
                setEnd={wrappedGeoHandlers.latitude.setLatEnd}
                min={sliderEndpoints ? sliderEndpoints.latMin : latitude.data.latMin}
                max={sliderEndpoints ? sliderEndpoints.latMax : latitude.data.latMax}
                step={0.1}
                onExpandEndpoint={onExpandEndpoint ? function (fieldName, value) { onExpandEndpoint(FIELD_TYPES.LAT, fieldName, value); } : null}
                onValidationChange={handleLatValidation}
                onLocalChange={handleGeoLocalChange}
              />

              <CompactLongitudeInput
                start={longitude.data.lonStart}
                end={longitude.data.lonEnd}
                setStart={wrappedGeoHandlers.longitude.setLonStart}
                setEnd={wrappedGeoHandlers.longitude.setLonEnd}
                min={sliderEndpoints ? sliderEndpoints.lonMin : longitude.data.lonMin}
                max={sliderEndpoints ? sliderEndpoints.lonMax : longitude.data.lonMax}
                step={0.1}
                onExpandEndpoint={onExpandEndpoint ? function (fieldName, value) { onExpandEndpoint(FIELD_TYPES.LON, fieldName, value); } : null}
                onValidationChange={handleLonValidation}
                onLocalChange={handleGeoLocalChange}
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
  geographicPresets: PropTypes.array,
  collectionExtent: PropTypes.shape({
    latMin: PropTypes.number.isRequired,
    latMax: PropTypes.number.isRequired,
    lonMin: PropTypes.number.isRequired,
    lonMax: PropTypes.number.isRequired,
  }),
  selectedPreset: PropTypes.string.isRequired,
  onPresetSelect: PropTypes.func.isRequired,
  wrappedGeoHandlers: PropTypes.shape({
    latitude: PropTypes.shape({
      setLatStart: PropTypes.func.isRequired,
      setLatEnd: PropTypes.func.isRequired,
    }).isRequired,
    longitude: PropTypes.shape({
      setLonStart: PropTypes.func.isRequired,
      setLonEnd: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  sliderEndpoints: PropTypes.shape({
    latMin: PropTypes.number,
    latMax: PropTypes.number,
    lonMin: PropTypes.number,
    lonMax: PropTypes.number,
    depthMin: PropTypes.number,
    depthMax: PropTypes.number,
  }),
  sliderMessage: PropTypes.string,
  onExpandEndpoint: PropTypes.func,
  onSubsetValidationChange: PropTypes.func,
  onGeoLocalChange: PropTypes.func,
};

export default CompactSubsetControlsLayout;
