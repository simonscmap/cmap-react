/**
 * CompactDepthInput - Compact horizontal control for depth range input
 *
 * Provides:
 * - Label + Slider + Two text inputs (start/end) in single horizontal line
 * - Integration with useRangeInput hook for validation and state management
 * - Two-phase updates: local preview during slider drag, commit on blur
 *
 * @module CompactDepthInput
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography, Slider } from '@material-ui/core';
import useMultiDatasetRangeInput from '../../hooks/useMultiDatasetRangeInput';
import useCompactRangeInputStyles from '../../hooks/useCompactRangeInputStyles';
import ValidationMessages from '../../../../shared/components/ValidationMessages';

const CompactDepthInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  step,
  onExpandEndpoint,
  onValidationChange,
  hasMixedClimatology,
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
  } = useMultiDatasetRangeInput({ start, end, setStart, setEnd, min, max, step, fieldType: 'depth', onExpandEndpoint });

  const startHasError = Boolean(startMessage) || isRangeInverted;
  const endHasError = Boolean(endMessage) || isRangeInverted;

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <Box className={classes.container}>
      {/* Section Title */}
      <Typography variant="body2" className={classes.sectionTitle}>
        DEPTH BOUNDS
      </Typography>

      {/* Input Row */}
      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <TextField
            type="text"
            size="small"
            variant="outlined"
            label="Min Depth (m)"
            value={localStartValue}
            onChange={handleSetStart}
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
            label="Max Depth (m)"
            value={localEndValue}
            onChange={handleSetEnd}
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
        maxMessages={hasMixedClimatology ? 3 : 2}
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

CompactDepthInput.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  setStart: PropTypes.func.isRequired,
  setEnd: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  onExpandEndpoint: PropTypes.func,
  onValidationChange: PropTypes.func,
  hasMixedClimatology: PropTypes.bool,
};

export default CompactDepthInput;
