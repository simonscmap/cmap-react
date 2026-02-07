/**
 * SpatialBoundsInput - Input component for spatial bounding box constraints
 *
 * Provides:
 * - Four number inputs for latitude/longitude (Start/End Latitude, Start/End Longitude)
 * - Preset dropdown for geographic boundaries
 * - Inline validation error display
 * - Integration with spatialTemporalSearchStore
 *
 * @module SpatialBoundsInput
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GeographicBoundaries } from '../../../../../shared/enum/geographicBoundariesCollections';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import { validateSpatialBounds } from '../../../../../shared/utility/spatialTemporalDepthValidation';
import ValidationMessages from '../../../../../shared/components/ValidationMessages';
import zIndex from '../../../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    minWidth: 90,
    lineHeight: 1.2,
  },
  presetControl: {
    minWidth: 200,
  },
  coordsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1), // Vertical gap between rows
    marginLeft: 106, // Align with content after title (90px + 16px gap)
  },
  coordRow: {
    display: 'flex',
    gap: theme.spacing(1), // Horizontal gap between Start/End coordinate pairs
  },
  coordField: {
    width: 140, // Fixed width to accommodate 12 characters
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
      {
        '-webkit-appearance': 'none',
        margin: 0,
      },
  },
  messagesContainer: {
    marginTop: theme.spacing(1),
    marginLeft: 106,
  },
}));

/**
 * SpatialBoundsInput component
 *
 * Renders input controls for spatial bounding box (lat/lon) with preset selection.
 * Connects to spatialTemporalSearchStore for state management.
 *
 * @returns {JSX.Element}
 */
const SpatialBoundsInput = () => {
  const classes = useStyles();

  // Store state and actions
  const { spatialBounds, selectedPreset, setSpatialBounds, applyPreset } =
    useSpatialTemporalSearchStore();

  // Local state for coordinate inputs and validation
  const [localBounds, setLocalBounds] = useState(spatialBounds);
  const [validationErrors, setValidationErrors] = useState([]);
  const [touched, setTouched] = useState(false);

  // Sync local state with store when store changes
  useEffect(() => {
    setLocalBounds(spatialBounds);
  }, [spatialBounds]);

  // Validate local bounds for immediate feedback
  useEffect(() => {
    const result = validateSpatialBounds(localBounds);
    setValidationErrors(result.errors);
  }, [localBounds]);

  const crossesDateline =
    typeof localBounds.lonMin === 'number' &&
    typeof localBounds.lonMax === 'number' &&
    localBounds.lonMin > localBounds.lonMax;

  /**
   * Handle preset selection from dropdown
   * @param {Event} e - Select change event
   */
  const handlePresetChange = (e) => {
    const presetLabel = e.target.value;

    if (presetLabel === '') {
      // "Select a preset" option - do nothing
      return;
    }

    // Find preset by label
    const preset = GeographicBoundaries.find((p) => p.label === presetLabel);

    if (preset) {
      applyPreset(preset);
    }
  };

  /**
   * Handle manual coordinate input - update local state only
   * @param {string} field - Field name (latMin, latMax, lonMin, lonMax)
   * @param {string} value - Input value
   */
  const handleCoordChange = (field, value) => {
    // Allow empty string or numeric values
    if (value === '' || value === '-') {
      setLocalBounds((prev) => ({ ...prev, [field]: value }));
      return;
    }

    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setLocalBounds((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setSpatialBounds(localBounds);
  };

  return (
    <Box className={classes.container}>
      {/* Header Row: Title + Preset Dropdown */}
      <Box className={classes.headerRow}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>
          Region of
          <br />
          Interest (ROI)
        </Typography>
        <FormControl variant="outlined" className={classes.presetControl}>
          <InputLabel shrink>Preset ROI</InputLabel>
          <Select
            value={selectedPreset || ''}
            onChange={handlePresetChange}
            label="Preset ROI"
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
      </Box>

      {/* Coordinate Inputs */}
      <Box className={classes.coordsGrid}>
        {/* Latitude Row */}
        <Box className={classes.coordRow}>
          <TextField
            type="number"
            label="Start Latitude (°)"
            variant="outlined"
            value={localBounds.latMin ?? ''}
            onChange={(e) => handleCoordChange('latMin', e.target.value)}
            onBlur={handleBlur}
            className={classes.coordField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 'any',
              min: -90,
              max: 90,
            }}
          />

          <TextField
            type="number"
            label="End Latitude (°)"
            variant="outlined"
            value={localBounds.latMax ?? ''}
            onChange={(e) => handleCoordChange('latMax', e.target.value)}
            onBlur={handleBlur}
            className={classes.coordField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 'any',
              min: -90,
              max: 90,
            }}
          />
        </Box>

        {/* Longitude Row */}
        <Box className={classes.coordRow}>
          <TextField
            type="number"
            label="Start Longitude (°)"
            variant="outlined"
            value={localBounds.lonMin ?? ''}
            onChange={(e) => handleCoordChange('lonMin', e.target.value)}
            onBlur={handleBlur}
            className={classes.coordField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 'any',
              min: -180,
              max: 180,
            }}
          />

          <TextField
            type="number"
            label="End Longitude (°)"
            variant="outlined"
            value={localBounds.lonMax ?? ''}
            onChange={(e) => handleCoordChange('lonMax', e.target.value)}
            onBlur={handleBlur}
            className={classes.coordField}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              step: 'any',
              min: -180,
              max: 180,
            }}
          />
        </Box>
      </Box>

      <Box className={classes.messagesContainer}>
        <ValidationMessages
          messages={[
            ...(touched ? validationErrors.map((text) => ({ type: 'error', text })) : []),
            ...(crossesDateline
              ? [{ type: 'info', text: 'The selected longitude values cross the dateline (antimeridian).' }]
              : []),
          ]}
        />
      </Box>
    </Box>
  );
};

export default SpatialBoundsInput;
