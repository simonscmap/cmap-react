/**
 * CompactSpatialBoundsInput - Composite component for spatial bounds with preset selection
 *
 * Provides:
 * - Preset dropdown for geographic boundaries
 * - CompactLatitudeInput for latitude range
 * - CompactLongitudeInput for longitude range
 *
 * @module CompactSpatialBoundsInput
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CompactLatitudeInput from './CompactLatitudeInput';
import CompactLongitudeInput from './CompactLongitudeInput';
import { GeographicBoundaries } from '../../../../enum/geographicBoundaries';
import zIndex from '../../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  presetControl: {
    minWidth: 200,
    maxWidth: 300,
  },
}));

/**
 * CompactSpatialBoundsInput component
 *
 * Renders a preset dropdown followed by compact latitude and longitude inputs.
 *
 * @param {Object} props
 * @param {Object} props.latitude - Latitude configuration
 * @param {number} props.latitude.start - Latitude minimum
 * @param {number} props.latitude.end - Latitude maximum
 * @param {Function} props.latitude.setStart - Callback to update latitude min
 * @param {Function} props.latitude.setEnd - Callback to update latitude max
 * @param {number} props.latitude.min - Minimum allowed latitude (-90)
 * @param {number} props.latitude.max - Maximum allowed latitude (90)
 * @param {Object} props.longitude - Longitude configuration
 * @param {number} props.longitude.start - Longitude minimum
 * @param {number} props.longitude.end - Longitude maximum
 * @param {Function} props.longitude.setStart - Callback to update longitude min
 * @param {Function} props.longitude.setEnd - Callback to update longitude max
 * @param {number} props.longitude.min - Minimum allowed longitude (-180)
 * @param {number} props.longitude.max - Maximum allowed longitude (180)
 * @param {string|null} props.selectedPreset - Currently selected preset label
 * @param {Function} props.onPresetChange - Callback when preset is selected
 * @returns {JSX.Element}
 */
const CompactSpatialBoundsInput = ({
  latitude,
  longitude,
  selectedPreset,
  onPresetChange,
}) => {
  const classes = useStyles();

  /**
   * Handle preset selection from dropdown
   */
  const handlePresetChange = (e) => {
    const presetLabel = e.target.value;

    if (presetLabel === '') {
      // "Select a preset" option - do nothing
      return;
    }

    // Find preset by label and call parent handler
    const preset = GeographicBoundaries.find((p) => p.label === presetLabel);
    if (preset && onPresetChange) {
      onPresetChange(preset);
    }
  };

  return (
    <Box className={classes.container}>
      {/* Preset Dropdown */}
      <FormControl
        variant="outlined"
        size="small"
        className={classes.presetControl}
      >
        <InputLabel shrink>Preset Geographic Bound</InputLabel>
        <Select
          value={selectedPreset || ''}
          onChange={handlePresetChange}
          label="Preset Geographic Bound"
          displayEmpty
          MenuProps={{
            style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
          }}
        >
          <MenuItem value="">
            <em>Select a preset</em>
          </MenuItem>
          {GeographicBoundaries.map((preset) => (
            <MenuItem key={preset.label} value={preset.label}>
              {preset.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Latitude Input */}
      <CompactLatitudeInput
        start={latitude.start}
        end={latitude.end}
        setStart={latitude.setStart}
        setEnd={latitude.setEnd}
        min={latitude.min}
        max={latitude.max}
        step={0.1}
      />

      {/* Longitude Input */}
      <CompactLongitudeInput
        start={longitude.start}
        end={longitude.end}
        setStart={longitude.setStart}
        setEnd={longitude.setEnd}
        min={longitude.min}
        max={longitude.max}
        step={0.1}
      />
    </Box>
  );
};

CompactSpatialBoundsInput.propTypes = {
  latitude: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    setStart: PropTypes.func.isRequired,
    setEnd: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  longitude: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    setStart: PropTypes.func.isRequired,
    setEnd: PropTypes.func.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  selectedPreset: PropTypes.string,
  onPresetChange: PropTypes.func.isRequired,
};

export default CompactSpatialBoundsInput;
