import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GeographicBoundaries } from '../../../enum/geographicBoundaries';
import zIndex from '../../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  presetControl: {
    width: '100%',
  },
}));

/**
 * Compact preset geographic bounds dropdown
 * Provides quick selection of common geographic regions
 *
 * @param {Object} props
 * @param {Object} props.currentBounds - Current lat/lon bounds
 * @param {number} props.currentBounds.latStart - Southern latitude
 * @param {number} props.currentBounds.latEnd - Northern latitude
 * @param {number} props.currentBounds.lonStart - Western longitude
 * @param {number} props.currentBounds.lonEnd - Eastern longitude
 * @param {Function} props.onPresetApply - Callback when preset is applied with bounds object
 */
const CompactPresetGeographicBounds = ({ currentBounds, onPresetApply }) => {
  const classes = useStyles();
  const [selectedPreset, setSelectedPreset] = useState('Global');

  /**
   * Handle preset selection from dropdown
   * Finds matching preset and calls onPresetApply with bounds
   */
  const handlePresetChange = (e) => {
    const presetLabel = e.target.value;
    if (presetLabel === '') {
      setSelectedPreset(null);
      return;
    }

    const preset = GeographicBoundaries.find((p) => p.label === presetLabel);
    if (preset) {
      onPresetApply({
        latStart: preset.southLatitude,
        latEnd: preset.northLatitude,
        lonStart: preset.westLongitude,
        lonEnd: preset.eastLongitude,
      });
      setSelectedPreset(preset.label);
    }
  };

  /**
   * Clear preset selection when bounds are manually edited
   * Detects when current bounds don't match selected preset
   */
  useEffect(() => {
    if (!selectedPreset) return;

    const currentPreset = GeographicBoundaries.find(
      (p) => p.label === selectedPreset,
    );
    if (!currentPreset) return;

    const boundsMatch =
      currentBounds.latStart === currentPreset.southLatitude &&
      currentBounds.latEnd === currentPreset.northLatitude &&
      currentBounds.lonStart === currentPreset.westLongitude &&
      currentBounds.lonEnd === currentPreset.eastLongitude;

    if (!boundsMatch) {
      setSelectedPreset(null);
    }
  }, [currentBounds, selectedPreset]);

  return (
    <FormControl variant="outlined" className={classes.presetControl}>
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
  );
};

CompactPresetGeographicBounds.propTypes = {
  currentBounds: PropTypes.shape({
    latStart: PropTypes.number.isRequired,
    latEnd: PropTypes.number.isRequired,
    lonStart: PropTypes.number.isRequired,
    lonEnd: PropTypes.number.isRequired,
  }).isRequired,
  onPresetApply: PropTypes.func.isRequired,
};

export default CompactPresetGeographicBounds;
