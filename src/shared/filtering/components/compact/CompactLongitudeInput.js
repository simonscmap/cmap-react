import React from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography, Slider } from '@material-ui/core';
import useCompactRangeInputStyles from '../../hooks/useCompactRangeInputStyles';
import ValidationMessages from '../../../../shared/components/ValidationMessages';

const CompactLongitudeInput = ({
  min,
  max,
  step,
  localStartValue,
  localEndValue,
  handleSetStart,
  handleSetEnd,
  handleBlurStart,
  handleBlurEnd,
  startMessage,
  endMessage,
  isRangeInverted,
  handleSlider,
  handleSliderCommit,
  sliderStart,
  sliderEnd,
  bounds,
  onLocalChange,
}) => {
  const classes = useCompactRangeInputStyles();

  const startHasError = Boolean(startMessage) || isRangeInverted;
  const endHasError = Boolean(endMessage) || isRangeInverted;

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
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  localStartValue: PropTypes.string.isRequired,
  localEndValue: PropTypes.string.isRequired,
  handleSetStart: PropTypes.func.isRequired,
  handleSetEnd: PropTypes.func.isRequired,
  handleBlurStart: PropTypes.func.isRequired,
  handleBlurEnd: PropTypes.func.isRequired,
  startMessage: PropTypes.string,
  endMessage: PropTypes.string,
  isRangeInverted: PropTypes.bool,
  handleSlider: PropTypes.func.isRequired,
  handleSliderCommit: PropTypes.func.isRequired,
  sliderStart: PropTypes.number.isRequired,
  sliderEnd: PropTypes.number.isRequired,
  bounds: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  onLocalChange: PropTypes.func,
};

export default CompactLongitudeInput;
