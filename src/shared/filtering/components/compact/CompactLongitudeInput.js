/**
 * CompactLongitudeInput - Compact horizontal control for longitude range input
 *
 * Provides:
 * - Label + Slider + Two text inputs (start/end) in single horizontal line
 * - Integration with useRangeInput hook for validation and state management
 * - Two-phase updates: local preview during slider drag, commit on blur
 *
 * @module CompactLongitudeInput
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography, Slider } from '@material-ui/core';
import useMultiDatasetRangeInput from '../../hooks/useMultiDatasetRangeInput';
import useCompactRangeInputStyles from '../../hooks/useCompactRangeInputStyles';
import ValidationMessages from '../../../../shared/components/ValidationMessages';

const CompactLongitudeInput = ({
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
  } = useMultiDatasetRangeInput({
    start,
    end,
    setStart,
    setEnd,
    min,
    max,
    step,
    allowInversion: true,
    fieldType: 'lon',
    onExpandEndpoint,
  });

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

  const localStartNum = parseFloat(localStartValue);
  const localEndNum = parseFloat(localEndValue);
  const showAntimeridianMessage = !isNaN(localStartNum) && !isNaN(localEndNum) && localStartNum > localEndNum;
  const isSliderInverted = sliderStart > sliderEnd;

  return (
    <Box className={classes.container}>
      {/* Input Row */}
      <Box className={classes.inputRow}>
        <Box className={classes.inputWrapper}>
          <TextField
            type="text"
            size="small"
            variant="outlined"
            label="W Longitude (°)"
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
            label="E Longitude (°)"
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
          showAntimeridianMessage ? { type: 'info', text: 'Selection crosses the dateline (antimeridian)' } : null,
        ].filter(Boolean)}
        maxMessages={3}
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
          track={isSliderInverted ? 'inverted' : 'normal'}
          classes={{ trackInverted: classes.trackInverted }}
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

CompactLongitudeInput.propTypes = {
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

export default CompactLongitudeInput;
