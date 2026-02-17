/**
 * CompactLatitudeInput - Compact horizontal control for latitude range input
 *
 * Provides:
 * - Label + Slider + Two text inputs (start/end) in single horizontal line
 * - Integration with useRangeInput hook for validation and state management
 * - Two-phase updates: local preview during slider drag, commit on blur
 *
 * @module CompactLatitudeInput
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography, Slider } from '@material-ui/core';
import useMultiDatasetRangeInput from '../../hooks/useMultiDatasetRangeInput';
import useCompactRangeInputStyles from '../../hooks/useCompactRangeInputStyles';
import ValidationMessages from '../../../../shared/components/ValidationMessages';

const CompactLatitudeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  step,
  onExpandEndpoint,
  onValidationChange,
  onLocalChange,
}) => {
  const classes = useCompactRangeInputStyles();

  const {
    localStartValue,
    localEndValue,
    handleSetStart,
    handleSetEnd,
    handleBlurStart,
    handleBlurEnd,
    startMessage,
    endMessage,
    isRangeInverted,
    isValid,
    handleSlider,
    handleSliderCommit,
    sliderStart,
    sliderEnd,
    bounds,
  } = useMultiDatasetRangeInput({ start, end, setStart, setEnd, min, max, step, fieldType: 'lat', onExpandEndpoint });

  const startHasError = Boolean(startMessage) || isRangeInverted;
  const endHasError = Boolean(endMessage) || isRangeInverted;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleStartChange = (e) => {
    handleSetStart(e);
    if (onLocalChange) {
      onLocalChange();
    }
  };

  const handleEndChange = (e) => {
    handleSetEnd(e);
    if (onLocalChange) {
      onLocalChange();
    }
  };

  return (
    <Box className={classes.container}>
      {/* Input Row */}
      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <TextField
            type="text"
            size="small"
            variant="outlined"
            label="S Latitude (°)"
            value={localStartValue}
            onChange={handleStartChange}
            onBlur={handleBlurStart}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.textField} ${startHasError ? classes.textFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              inputMode: 'decimal',
            }}
          />
        </Box>
        <Box className={classes.inputWrapper}>
          <TextField
            type="text"
            size="small"
            variant="outlined"
            label="N Latitude (°)"
            value={localEndValue}
            onChange={handleEndChange}
            onBlur={handleBlurEnd}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className={`${classes.textField} ${endHasError ? classes.textFieldError : ''}`}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              inputMode: 'decimal',
            }}
          />
        </Box>
      </Box>
      <ValidationMessages
        messages={[
          startMessage ? { type: 'error', text: startMessage } : null,
          endMessage ? { type: 'error', text: endMessage } : null,
        ].filter(Boolean)}
        maxMessages={2}
      />

      {/* Slider */}
      <Box className={classes.sliderBox}>
        <Slider
          value={[sliderStart, sliderEnd]}
          onChange={handleSlider}
          onChangeCommitted={handleSliderCommit}
          min={bounds.min}
          max={bounds.max}
          step={step}
          valueLabelDisplay="auto"
          marks={false}
          ThumbComponent={(props) => <span {...props} tabIndex={-1} />}
        />
      </Box>

      {/* Bounds Row */}
      <Box className={classes.boundsRow}>
        <Typography variant="caption" className={classes.boundLabel}>
          {min}
        </Typography>
        <Typography variant="caption" className={classes.boundLabel}>
          {max}
        </Typography>
      </Box>
    </Box>
  );
};

CompactLatitudeInput.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  setStart: PropTypes.func.isRequired,
  setEnd: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  onExpandEndpoint: PropTypes.func,
  onValidationChange: PropTypes.func,
  onLocalChange: PropTypes.func,
};

export default CompactLatitudeInput;
