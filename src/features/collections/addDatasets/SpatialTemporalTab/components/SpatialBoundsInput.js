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
import ValidationMessages from '../../../../../shared/components/ValidationMessages';
import zIndex from '../../../../../enums/zIndex';
import colors from '../../../../../enums/colors';

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
    gap: theme.spacing(1),
    marginLeft: 106,
  },
  coordRow: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  coordField: {
    width: 140,
  },
  messagesContainer: {
    marginTop: theme.spacing(1),
    marginLeft: 106,
  },
  coordFieldError: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: colors.blockingError },
      '&:hover fieldset': { borderColor: colors.blockingError },
      '&.Mui-focused fieldset': { borderColor: colors.blockingError },
    },
    '& .MuiInputLabel-root': { color: colors.blockingError },
  },
}));

const isIntermediate = (v) => {
  let s = String(v).trim();
  return s === '' || s === '-' || s === '.' || s === '-.' || s === '-0' || s === '0.';
};

const SpatialBoundsInput = () => {
  const classes = useStyles();

  const spatialBounds = useSpatialTemporalSearchStore((state) => state.spatialBounds);
  const selectedPreset = useSpatialTemporalSearchStore((state) => state.selectedPreset);
  const spatialFieldErrors = useSpatialTemporalSearchStore((state) => state.spatialFieldErrors);
  const spatialFieldInteraction = useSpatialTemporalSearchStore((state) => state.spatialFieldInteraction);
  const spatialErrorRevealed = useSpatialTemporalSearchStore((state) => state.spatialErrorRevealed);
  const spatialWarnings = useSpatialTemporalSearchStore((state) => state.spatialWarnings);
  const setSpatialBounds = useSpatialTemporalSearchStore((state) => state.setSpatialBounds);
  const validateSpatialInput = useSpatialTemporalSearchStore((state) => state.validateSpatialInput);
  const applyPreset = useSpatialTemporalSearchStore((state) => state.applyPreset);
  const markFieldFocused = useSpatialTemporalSearchStore((state) => state.markFieldFocused);
  const markFieldBlurred = useSpatialTemporalSearchStore((state) => state.markFieldBlurred);
  const revealError = useSpatialTemporalSearchStore((state) => state.revealError);
  const clearErrorRevealed = useSpatialTemporalSearchStore((state) => state.clearErrorRevealed);

  const [localBounds, setLocalBounds] = useState({
    latMin: spatialBounds.latMin !== null && spatialBounds.latMin !== undefined ? String(spatialBounds.latMin) : '',
    latMax: spatialBounds.latMax !== null && spatialBounds.latMax !== undefined ? String(spatialBounds.latMax) : '',
    lonMin: spatialBounds.lonMin !== null && spatialBounds.lonMin !== undefined ? String(spatialBounds.lonMin) : '',
    lonMax: spatialBounds.lonMax !== null && spatialBounds.lonMax !== undefined ? String(spatialBounds.lonMax) : '',
  });

  useEffect(() => {
    setLocalBounds({
      latMin: spatialBounds.latMin !== null && spatialBounds.latMin !== undefined ? String(spatialBounds.latMin) : '',
      latMax: spatialBounds.latMax !== null && spatialBounds.latMax !== undefined ? String(spatialBounds.latMax) : '',
      lonMin: spatialBounds.lonMin !== null && spatialBounds.lonMin !== undefined ? String(spatialBounds.lonMin) : '',
      lonMax: spatialBounds.lonMax !== null && spatialBounds.lonMax !== undefined ? String(spatialBounds.lonMax) : '',
    });
    // Note: Don't reset interaction here - that's handled by applyPreset for external changes.
    // Internal changes (user blur commits) should preserve interaction state.
  }, [spatialBounds]);

  useEffect(() => {
    validateSpatialInput(localBounds);
  }, [localBounds, validateSpatialInput]);

  const handlePresetChange = (e) => {
    let presetLabel = e.target.value;

    if (presetLabel === '') {
      return;
    }

    let preset = GeographicBoundaries.find((p) => p.label === presetLabel);

    if (preset) {
      applyPreset(preset);
    }
  };

  const handleCoordChange = (field, value) => {
    setLocalBounds((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldFocus = (field) => {
    markFieldFocused('spatial', field);
  };

  const handleFieldBlur = (field) => {
    markFieldBlurred('spatial', field);

    let boundsToCommit = {};
    let hasChanges = false;
    ['latMin', 'latMax', 'lonMin', 'lonMax'].forEach((f) => {
      let val = localBounds[f];
      let newVal;
      if (isIntermediate(val)) {
        newVal = '';
      } else {
        let num = Number(val);
        newVal = isNaN(num) ? val : num;
      }
      boundsToCommit[f] = newVal;
      if (newVal !== spatialBounds[f]) {
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSpatialBounds(boundsToCommit);
    }
  };

  useEffect(() => {
    ['latMin', 'latMax', 'lonMin', 'lonMax'].forEach((field) => {
      let err = spatialFieldErrors[field];
      let interaction = spatialFieldInteraction[field];
      let revealed = spatialErrorRevealed[field];

      if (err && err.message) {
        let shouldReveal = !err.blurOnly || interaction === null || interaction === true;
        if (shouldReveal && !revealed) {
          revealError('spatial', field);
        }
      } else if (revealed) {
        clearErrorRevealed('spatial', field);
      }
    });
  }, [spatialFieldErrors, spatialFieldInteraction, spatialErrorRevealed, revealError, clearErrorRevealed]);

  let fieldHasDisplayedError = (field) => {
    let err = spatialFieldErrors[field];
    let revealed = spatialErrorRevealed[field];
    return err && err.message && (!err.blurOnly || revealed);
  };

  let displayErrors = [];
  ['latMin', 'latMax', 'lonMin', 'lonMax'].forEach((field) => {
    if (fieldHasDisplayedError(field)) {
      displayErrors.push(spatialFieldErrors[field].message);
    }
  });

  let latMinNum = parseFloat(localBounds.latMin);
  let latMaxNum = parseFloat(localBounds.latMax);
  let isLatRangeInverted = !isNaN(latMinNum) && !isNaN(latMaxNum) && latMinNum > latMaxNum;
  let latInversionDisplayed = fieldHasDisplayedError('latMin') && isLatRangeInverted;

  let latMinHasError = fieldHasDisplayedError('latMin') || latInversionDisplayed;
  let latMaxHasError = fieldHasDisplayedError('latMax') || latInversionDisplayed;

  let lonMinHasError = fieldHasDisplayedError('lonMin');
  let lonMaxHasError = fieldHasDisplayedError('lonMax');

  return (
    <Box className={classes.container}>
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

      <Box className={classes.coordsGrid}>
        <Box className={classes.coordRow}>
          <TextField
            type="text"
            label="Start Latitude (°)"
            variant="outlined"
            value={localBounds.latMin}
            onChange={(e) => handleCoordChange('latMin', e.target.value)}
            onFocus={() => handleFieldFocus('latMin')}
            onBlur={() => handleFieldBlur('latMin')}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.coordField} ${latMinHasError ? classes.coordFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: 'decimal' }}
          />

          <TextField
            type="text"
            label="End Latitude (°)"
            variant="outlined"
            value={localBounds.latMax}
            onChange={(e) => handleCoordChange('latMax', e.target.value)}
            onFocus={() => handleFieldFocus('latMax')}
            onBlur={() => handleFieldBlur('latMax')}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.coordField} ${latMaxHasError ? classes.coordFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Box>

        <Box className={classes.coordRow}>
          <TextField
            type="text"
            label="Start Longitude (°)"
            variant="outlined"
            value={localBounds.lonMin}
            onChange={(e) => handleCoordChange('lonMin', e.target.value)}
            onFocus={() => handleFieldFocus('lonMin')}
            onBlur={() => handleFieldBlur('lonMin')}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.coordField} ${lonMinHasError ? classes.coordFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: 'decimal' }}
          />

          <TextField
            type="text"
            label="End Longitude (°)"
            variant="outlined"
            value={localBounds.lonMax}
            onChange={(e) => handleCoordChange('lonMax', e.target.value)}
            onFocus={() => handleFieldFocus('lonMax')}
            onBlur={() => handleFieldBlur('lonMax')}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.coordField} ${lonMaxHasError ? classes.coordFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Box>
      </Box>

      <Box className={classes.messagesContainer}>
        <ValidationMessages
          messages={[
            ...displayErrors.map((text) => ({ type: 'error', text })),
            ...spatialWarnings.map((text) => ({ type: 'info', text })),
          ]}
          maxMessages={4}
        />
      </Box>
    </Box>
  );
};

export default SpatialBoundsInput;
