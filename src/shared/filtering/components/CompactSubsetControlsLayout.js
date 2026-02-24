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
import MonthlyDateSubsetControl from './controls/MonthlyDateSubsetControl';
import ToggleWithHelp from '../../components/ToggleWithHelp';
import useMultiDatasetRangeInput from '../hooks/useMultiDatasetRangeInput';
import { FIELD_TYPES } from '../utils/endpointFields';
import { MapBoundsSelector } from '../map';

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
  geographicWithMapRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  geographicInputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    flex: '0 0 40%',
    [theme.breakpoints.down('sm')]: {
      flex: '1 1 100%',
    },
  },
  mapColumn: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
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
  onExpandEndpoint,
  onSubsetValidationChange,
  onGeoLocalChange,
  resetButton,
}) => {
  const classes = useStyles();

  const { date, latitude, longitude, depth } = controls;

  const [latValid, setLatValid] = useState(true);
  const [lonValid, setLonValid] = useState(true);
  const [depthValid, setDepthValid] = useState(true);
  const [dateInvalid, setDateInvalid] = useState(false);

  const latMin = sliderEndpoints ? sliderEndpoints.latMin : (latitude && latitude.data ? latitude.data.latMin : -90);
  const latMax = sliderEndpoints ? sliderEndpoints.latMax : (latitude && latitude.data ? latitude.data.latMax : 90);
  const lonMin = sliderEndpoints ? sliderEndpoints.lonMin : (longitude && longitude.data ? longitude.data.lonMin : -180);
  const lonMax = sliderEndpoints ? sliderEndpoints.lonMax : (longitude && longitude.data ? longitude.data.lonMax : 180);

  const latRange = useMultiDatasetRangeInput({
    start: latitude && latitude.data ? latitude.data.latStart : 0,
    end: latitude && latitude.data ? latitude.data.latEnd : 0,
    setStart: wrappedGeoHandlers.latitude.setLatStart,
    setEnd: wrappedGeoHandlers.latitude.setLatEnd,
    min: latMin,
    max: latMax,
    step: 0.1,
    fieldType: 'lat',
    onExpandEndpoint: onExpandEndpoint ? function (fieldName, value) { onExpandEndpoint(FIELD_TYPES.LAT, fieldName, value); } : null,
  });

  const lonRange = useMultiDatasetRangeInput({
    start: longitude && longitude.data ? longitude.data.lonStart : 0,
    end: longitude && longitude.data ? longitude.data.lonEnd : 0,
    setStart: wrappedGeoHandlers.longitude.setLonStart,
    setEnd: wrappedGeoHandlers.longitude.setLonEnd,
    min: lonMin,
    max: lonMax,
    step: 0.1,
    allowInversion: true,
    fieldType: 'lon',
    onExpandEndpoint: onExpandEndpoint ? function (fieldName, value) { onExpandEndpoint(FIELD_TYPES.LON, fieldName, value); } : null,
  });

  const isSubsetValid = latValid && lonValid && depthValid && !dateInvalid;

  useEffect(() => {
    if (onSubsetValidationChange) {
      onSubsetValidationChange(isSubsetValid);
    }
  }, [isSubsetValid, onSubsetValidationChange]);

  useEffect(() => {
    setLatValid(latRange.isValid);
  }, [latRange.isValid]);

  useEffect(() => {
    setLonValid(lonRange.isValid);
  }, [lonRange.isValid]);

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
          <Box className={classes.geographicWithMapRow}>
            <Box className={classes.geographicInputsColumn}>
              <Typography
                variant="body2"
                className={classes.geographicSectionTitle}
              >
                GEOGRAPHIC BOUNDS
              </Typography>

              <CompactPresetGeographicBounds
                selectedPreset={selectedPreset}
                onPresetSelect={onPresetSelect}
                geographicPresets={geographicPresets}
                collectionExtent={collectionExtent}
              />

              <CompactLatitudeInput
                min={latMin}
                max={latMax}
                step={0.1}
                localStartValue={latRange.localStartValue}
                localEndValue={latRange.localEndValue}
                handleSetStart={latRange.handleSetStart}
                handleSetEnd={latRange.handleSetEnd}
                handleBlurStart={latRange.handleBlurStart}
                handleBlurEnd={latRange.handleBlurEnd}
                startMessage={latRange.startMessage}
                endMessage={latRange.endMessage}
                isRangeInverted={latRange.isRangeInverted}
                handleSlider={latRange.handleSlider}
                handleSliderCommit={latRange.handleSliderCommit}
                sliderStart={latRange.sliderStart}
                sliderEnd={latRange.sliderEnd}
                bounds={latRange.bounds}
                onLocalChange={handleGeoLocalChange}
              />

              <CompactLongitudeInput
                min={lonMin}
                max={lonMax}
                step={0.1}
                localStartValue={lonRange.localStartValue}
                localEndValue={lonRange.localEndValue}
                handleSetStart={lonRange.handleSetStart}
                handleSetEnd={lonRange.handleSetEnd}
                handleBlurStart={lonRange.handleBlurStart}
                handleBlurEnd={lonRange.handleBlurEnd}
                startMessage={lonRange.startMessage}
                endMessage={lonRange.endMessage}
                isRangeInverted={lonRange.isRangeInverted}
                handleSlider={lonRange.handleSlider}
                handleSliderCommit={lonRange.handleSliderCommit}
                sliderStart={lonRange.sliderStart}
                sliderEnd={lonRange.sliderEnd}
                bounds={lonRange.bounds}
                onLocalChange={handleGeoLocalChange}
              />

              <Box style={{ marginTop: 'auto' }}>
                {resetButton}
              </Box>
            </Box>

            <Box className={classes.mapColumn}>
              <MapBoundsSelector
                latStart={latRange.sliderStart}
                latEnd={latRange.sliderEnd}
                lonStart={lonRange.sliderStart}
                lonEnd={lonRange.sliderEnd}
                setLatStart={wrappedGeoHandlers.latitude.setLatStart}
                setLatEnd={wrappedGeoHandlers.latitude.setLatEnd}
                setLonStart={wrappedGeoHandlers.longitude.setLonStart}
                setLonEnd={wrappedGeoHandlers.longitude.setLonEnd}
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
  }),
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
  onExpandEndpoint: PropTypes.func,
  onSubsetValidationChange: PropTypes.func,
  onGeoLocalChange: PropTypes.func,
};

export default CompactSubsetControlsLayout;
