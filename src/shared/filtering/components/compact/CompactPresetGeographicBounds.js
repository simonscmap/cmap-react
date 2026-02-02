import React, { useMemo } from 'react';
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

const PSEUDO_PRESET_LABELS = {
  COLLECTION_EXTENT: 'Collection Extent',
  CUSTOM: 'Custom',
};

const DISABLED_TOOLTIP_MESSAGE = 'No datasets overlap with this region';

const CompactPresetGeographicBounds = ({
  selectedPreset,
  onPresetSelect,
  geographicPresets,
  collectionExtent,
}) => {
  const classes = useStyles();

  const mergedPresets = useMemo(() => {
    const basePresets = geographicPresets || DefaultGeographicBoundaries;
    if (!collectionExtent) return basePresets;

    const collectionPreset = {
      label: PSEUDO_PRESET_LABELS.COLLECTION_EXTENT,
      southLatitude: collectionExtent.latMin,
      northLatitude: collectionExtent.latMax,
      westLongitude: collectionExtent.lonMin,
      eastLongitude: collectionExtent.lonMax,
    };
    return [collectionPreset, ...basePresets];
  }, [geographicPresets, collectionExtent]);

  const datasetsMetadata = useMultiDatasetDownloadStore(
    (state) => state.datasetsMetadata,
  );

  const disabledPresets = useMemo(() => {
    if (!datasetsMetadata || datasetsMetadata.length === 0) {
      return new Map();
    }
    return computePresetDisabledStates(mergedPresets, datasetsMetadata);
  }, [datasetsMetadata, mergedPresets]);

  const handlePresetChange = (e) => {
    const presetLabel = e.target.value;
    if (presetLabel === '' || presetLabel === PSEUDO_PRESET_LABELS.CUSTOM) {
      return;
    }

    const preset = mergedPresets.find((p) => p.label === presetLabel);
    if (preset) {
      onPresetSelect(presetLabel, {
        latStart: preset.southLatitude,
        latEnd: preset.northLatitude,
        lonStart: preset.westLongitude,
        lonEnd: preset.eastLongitude,
      }, preset);
    }
  };

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
        {selectedPreset === PSEUDO_PRESET_LABELS.CUSTOM && (
          <MenuItem value={PSEUDO_PRESET_LABELS.CUSTOM} disabled>
            <em>Custom</em>
          </MenuItem>
        )}
        {selectedPreset !== PSEUDO_PRESET_LABELS.CUSTOM && (
          <MenuItem value="">
            <em>Select a preset</em>
          </MenuItem>
        )}
        {mergedPresets.map((preset) => {
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
  selectedPreset: PropTypes.string.isRequired,
  onPresetSelect: PropTypes.func.isRequired,
  geographicPresets: PropTypes.array,
  collectionExtent: PropTypes.shape({
    latMin: PropTypes.number.isRequired,
    latMax: PropTypes.number.isRequired,
    lonMin: PropTypes.number.isRequired,
    lonMax: PropTypes.number.isRequired,
  }),
};

export default CompactPresetGeographicBounds;
