import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GeographicBoundaries as DefaultGeographicBoundaries } from '../../../enum/geographicBoundaries';
import { computePresetDisabledStates } from '../../utils/geographicOverlap';
import useMultiDatasetDownloadStore from '../../../../features/multiDatasetDownload/stores/multiDatasetDownloadStore';
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
const DISABLED_TOOLTIP_MESSAGE = 'No datasets overlap with this region';

const CompactPresetGeographicBounds = ({
  currentBounds,
  onPresetApply,
  geographicPresets,
}) => {
  const classes = useStyles();
  const [selectedPreset, setSelectedPreset] = useState('Global');

  const presets = geographicPresets || DefaultGeographicBoundaries;

  const datasetsMetadata = useMultiDatasetDownloadStore(
    (state) => state.datasetsMetadata,
  );

  const disabledPresets = useMemo(() => {
    if (!datasetsMetadata || datasetsMetadata.length === 0) {
      return new Map();
    }
    return computePresetDisabledStates(presets, datasetsMetadata);
  }, [datasetsMetadata, presets]);

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

    const preset = presets.find((p) => p.label === presetLabel);
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

    const currentPreset = presets.find((p) => p.label === selectedPreset);
    if (!currentPreset) return;

    const boundsMatch =
      currentBounds.latStart === currentPreset.southLatitude &&
      currentBounds.latEnd === currentPreset.northLatitude &&
      currentBounds.lonStart === currentPreset.westLongitude &&
      currentBounds.lonEnd === currentPreset.eastLongitude;

    if (!boundsMatch) {
      setSelectedPreset(null);
    }
  }, [currentBounds, selectedPreset, presets]);

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
        {presets.map((preset) => {
          const isDisabled = disabledPresets.get(preset.label) || false;

          if (isDisabled) {
            return (
              <Tooltip
                key={preset.label}
                title={DISABLED_TOOLTIP_MESSAGE}
                placement="right"
                PopperProps={{
                  style: { zIndex: zIndex.MODAL_LAYER_3_POPPER },
                }}
              >
                <span style={{ display: 'block' }}>
                  <MenuItem
                    value={preset.label}
                    disabled
                    style={{ opacity: 0.5 }}
                  >
                    {preset.label}
                  </MenuItem>
                </span>
              </Tooltip>
            );
          }

          return (
            <MenuItem key={preset.label} value={preset.label}>
              {preset.label}
            </MenuItem>
          );
        })}
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
  geographicPresets: PropTypes.array,
};

export default CompactPresetGeographicBounds;
