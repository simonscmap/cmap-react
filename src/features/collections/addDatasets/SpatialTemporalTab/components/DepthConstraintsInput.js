import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import ValidationMessages from '../../../../../shared/components/ValidationMessages';
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
  },
  titleColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 90,
  },
  sectionTitle: {
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    lineHeight: 1.2,
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: -11,
  },
  inputsRow: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  depthField: {
    width: 140,
  },
  inputsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  depthFieldError: {
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
  return s === '' || s === '.' || s === '0.';
};

const DepthConstraintsInput = () => {
  const classes = useStyles();

  const depthEnabled = useSpatialTemporalSearchStore((state) => state.depthEnabled);
  const depthRange = useSpatialTemporalSearchStore((state) => state.depthRange);
  const depthFieldErrors = useSpatialTemporalSearchStore((state) => state.depthFieldErrors);
  const depthFieldInteraction = useSpatialTemporalSearchStore((state) => state.depthFieldInteraction);
  const depthErrorRevealed = useSpatialTemporalSearchStore((state) => state.depthErrorRevealed);
  const setDepthConstraints = useSpatialTemporalSearchStore((state) => state.setDepthConstraints);
  const validateDepthInput = useSpatialTemporalSearchStore((state) => state.validateDepthInput);
  const markFieldFocused = useSpatialTemporalSearchStore((state) => state.markFieldFocused);
  const markFieldBlurred = useSpatialTemporalSearchStore((state) => state.markFieldBlurred);
  const revealError = useSpatialTemporalSearchStore((state) => state.revealError);
  const clearErrorRevealed = useSpatialTemporalSearchStore((state) => state.clearErrorRevealed);

  const [depthMin, setDepthMin] = useState(
    depthRange.depthMin !== null && depthRange.depthMin !== undefined ? String(depthRange.depthMin) : ''
  );
  const [depthMax, setDepthMax] = useState(
    depthRange.depthMax !== null && depthRange.depthMax !== undefined ? String(depthRange.depthMax) : ''
  );

  const prevBlurOnly = useRef({ depthMin: undefined, depthMax: undefined });

  useEffect(() => {
    setDepthMin(depthRange.depthMin !== null && depthRange.depthMin !== undefined ? String(depthRange.depthMin) : '');
    setDepthMax(depthRange.depthMax !== null && depthRange.depthMax !== undefined ? String(depthRange.depthMax) : '');
    // Note: Don't reset interaction here - that's handled by setDepthConstraints when enabling.
    // Internal changes (user blur commits) should preserve interaction state.
  }, [depthRange.depthMin, depthRange.depthMax]);

  useEffect(() => {
    validateDepthInput({ depthMin, depthMax });
  }, [depthMin, depthMax, depthEnabled, validateDepthInput]);

  const handleEnabledChange = (event) => {
    let enabled = event.target.checked;
    setDepthConstraints(enabled, null);
  };

  const handleDepthMinChange = (event) => {
    setDepthMin(event.target.value);
  };

  const handleDepthMaxChange = (event) => {
    setDepthMax(event.target.value);
  };

  const handleFieldFocus = (field) => {
    markFieldFocused('depth', field);
  };

  const handleFieldBlur = (field) => {
    markFieldBlurred('depth', field);

    if (!depthEnabled) {
      return;
    }

    let minVal = isIntermediate(depthMin) ? null : Number(depthMin);
    let maxVal = isIntermediate(depthMax) ? null : Number(depthMax);

    if (isNaN(minVal)) minVal = null;
    if (isNaN(maxVal)) maxVal = null;

    setDepthConstraints(depthEnabled, {
      depthMin: minVal,
      depthMax: maxVal,
    });
  };

  useEffect(() => {
    ['depthMin', 'depthMax'].forEach((field) => {
      let err = depthFieldErrors[field];
      let interaction = depthFieldInteraction[field];
      let revealed = depthErrorRevealed[field];
      let wasBlurOnly = prevBlurOnly.current[field];

      if (err && err.message) {
        if (err.blurOnly && wasBlurOnly === false && interaction === false && revealed) {
          clearErrorRevealed('depth', field);
        } else {
          let shouldReveal = !err.blurOnly || interaction === null || interaction === true;
          if (shouldReveal && !revealed) {
            revealError('depth', field);
          }
        }
        prevBlurOnly.current[field] = err.blurOnly;
      } else {
        if (revealed) {
          clearErrorRevealed('depth', field);
        }
        prevBlurOnly.current[field] = undefined;
      }
    });
  }, [depthFieldErrors, depthFieldInteraction, depthErrorRevealed, revealError, clearErrorRevealed]);

  let fieldHasDisplayedError = (field) => {
    let err = depthFieldErrors[field];
    let revealed = depthErrorRevealed[field];
    return err && err.message && (!err.blurOnly || revealed);
  };

  let displayErrors = [];
  ['depthMin', 'depthMax'].forEach((field) => {
    if (fieldHasDisplayedError(field)) {
      displayErrors.push(depthFieldErrors[field].message);
    }
  });

  let depthMinNum = parseFloat(depthMin);
  let depthMaxNum = parseFloat(depthMax);
  let isDepthRangeInverted = !isNaN(depthMinNum) && !isNaN(depthMaxNum) && depthMinNum > depthMaxNum;
  let depthInversionDisplayed = fieldHasDisplayedError('depthMin') && isDepthRangeInverted;

  let depthMinHasError = fieldHasDisplayedError('depthMin') || depthInversionDisplayed;
  let depthMaxHasError = fieldHasDisplayedError('depthMax') || depthInversionDisplayed;

  return (
    <Box className={classes.container}>
      <Box className={classes.headerRow}>
        <Box className={classes.titleColumn}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            Depth
            <br />
            Bounds
          </Typography>
          <Box className={classes.checkboxContainer}>
            <Checkbox
              checked={depthEnabled}
              onChange={handleEnabledChange}
              color="primary"
              size="small"
            />
            <Typography variant="body2">Enable</Typography>
          </Box>
        </Box>

        <Box className={classes.inputsColumn}>
          <Box
            className={classes.inputsRow}
            style={depthEnabled ? undefined : { visibility: 'hidden' }}
          >
            <TextField
              className={`${classes.depthField} ${depthMinHasError ? classes.depthFieldError : ''}`}
              label="Min Depth (m)"
              type="text"
              value={depthMin}
              onChange={handleDepthMinChange}
              onFocus={() => handleFieldFocus('depthMin')}
              onBlur={() => handleFieldBlur('depthMin')}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ inputMode: 'decimal' }}
            />
            <TextField
              className={`${classes.depthField} ${depthMaxHasError ? classes.depthFieldError : ''}`}
              label="Max Depth (m)"
              type="text"
              value={depthMax}
              onChange={handleDepthMaxChange}
              onFocus={() => handleFieldFocus('depthMax')}
              onBlur={() => handleFieldBlur('depthMax')}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ inputMode: 'decimal' }}
            />
          </Box>
          <ValidationMessages
            messages={displayErrors.map((text) => ({ type: 'error', text }))}
            maxMessages={2}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DepthConstraintsInput;
