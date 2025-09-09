import React, { useState, useEffect } from 'react';
import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import styles from '../../styles/subsetControlStyles';

// Utility functions
const DEFAULT_LAT_MIN = -90;
const DEFAULT_LAT_MAX = 90;
const LAT_STEP = 0.1;

const roundToStep = (value, step = LAT_STEP) => {
  return Math.round(value / step) * step;
};

const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const getEffectiveBounds = (latMin, latMax) => ({
  min: isNaN(latMin) ? DEFAULT_LAT_MIN : Math.floor(latMin * 10) / 10,
  max: isNaN(latMax) ? DEFAULT_LAT_MAX : Math.ceil(latMax * 10) / 10,
});

const getDefaultValue = (isStart, latMin, latMax) => {
  const bounds = getEffectiveBounds(latMin, latMax);
  return isStart ? bounds.min : bounds.max;
};

const LatTextInput = ({
  latMin,
  latMax,
  displayValue,
  handleChange,
  handleBlur,
  validationMessage,
  label,
  id,
  constraintMin,
  constraintMax,
}) => {
  const bounds = getEffectiveBounds(latMin, latMax);
  const effectiveMin = constraintMin !== undefined ? constraintMin : bounds.min;
  const effectiveMax = constraintMax !== undefined ? constraintMax : bounds.max;

  return (
    <div style={styles.latInputContainer}>
      <TextField
        id={id}
        key={id}
        label={label}
        type="number"
        inputProps={{
          step: LAT_STEP,
          min: effectiveMin,
          max: effectiveMax,
          className: styles.input,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <Typography variant="caption" style={styles.validationMessage}>
        {validationMessage || ''}
      </Typography>
    </div>
  );
};

const LatSlider = ({ latMin, latMax, latStart, latEnd, handleSlider }) => {
  const bounds = getEffectiveBounds(latMin, latMax);

  return (
    <Slider
      id="latSlider"
      key="latSlider"
      min={bounds.min}
      max={bounds.max}
      step={LAT_STEP}
      value={[
        typeof latStart === 'number' ? latStart : DEFAULT_LAT_MIN,
        typeof latEnd === 'number' ? latEnd : DEFAULT_LAT_MAX,
      ]}
      onChange={handleSlider}
      classes={{
        valueLabel: styles.sliderValueLabel,
        thumb: styles.sliderThumb,
        markLabel: styles.markLabel,
      }}
      style={styles.slider}
      disabled={latMin === latMax}
      marks={[
        {
          value: bounds.min,
          label: `${bounds.min}`,
        },
        {
          value: bounds.max,
          label: `${bounds.max}`,
        },
      ]}
    />
  );
};

const LatitudeSubsetControl = (props) => {
  let { latMin, latMax, subsetState, setLatStart, setLatEnd } = props;
  let { latStart, latEnd } = subsetState;

  // Local state for typing values (two-phase updates)
  const [localStartValue, setLocalStartValue] = useState('');
  const [localEndValue, setLocalEndValue] = useState('');

  // Validation message state
  const [startMessage, setStartMessage] = useState('');
  const [endMessage, setEndMessage] = useState('');

  // Update local values when committed values change
  useEffect(() => {
    setLocalStartValue(latStart === null ? '' : String(latStart));
  }, [latStart]);

  useEffect(() => {
    setLocalEndValue(latEnd === null ? '' : String(latEnd));
  }, [latEnd]);

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setLatStart(start);
    setLatEnd(end);
  };

  // onChange handlers for text inputs - update local state only
  let handleSetStart = (e) => {
    setLocalStartValue(e.target.value);
  };

  let handleSetEnd = (e) => {
    setLocalEndValue(e.target.value);
  };

  // Helper function to show validation message with auto-hide
  const showMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 3000);
  };

  // Generic blur handler for both start and end inputs
  const createBlurHandler = (isStart, localValue, setValue, setMessage) => {
    return () => {
      let value = parseFloat(localValue);
      const bounds = getEffectiveBounds(latMin, latMax);

      // Handle empty fields - restore to default
      if (isNaN(value) || localValue.trim() === '') {
        const defaultValue = getDefaultValue(isStart, latMin, latMax);
        setValue(defaultValue);
        // Update local display value immediately
        if (isStart) {
          setLocalStartValue(String(defaultValue));
        } else {
          setLocalEndValue(String(defaultValue));
        }
        showMessage(
          setMessage,
          isStart ? 'Restored to min' : 'Restored to max',
        );
        return;
      }

      // Round to step
      value = roundToStep(value);

      // Clamp to dataset bounds
      const originalAfterRounding = value;
      value = clampValue(value, bounds.min, bounds.max);

      // Check if clamping occurred
      if (value > originalAfterRounding) {
        showMessage(setMessage, `Min is ${bounds.min}`);
      } else if (value < originalAfterRounding) {
        showMessage(setMessage, `Max is ${bounds.max}`);
      }

      // Ensure start <= end constraint
      const otherValue = isStart ? latEnd : latStart;
      if (otherValue !== null) {
        if (isStart && value > otherValue) {
          value = otherValue;
          setLocalStartValue(String(value)); // Immediately update display
          showMessage(setMessage, `Max is ${otherValue}`);
        } else if (!isStart && value < otherValue) {
          value = otherValue;
          setLocalEndValue(String(value)); // Immediately update display
          showMessage(setMessage, `Min is ${otherValue}`);
        }
      }

      setValue(value);
    };
  };

  // Create specific blur handlers using the generic function
  const handleBlurStart = createBlurHandler(
    true,
    localStartValue,
    setLatStart,
    setStartMessage,
  );

  const handleBlurEnd = createBlurHandler(
    false,
    localEndValue,
    setLatEnd,
    setEndMessage,
  );

  let controlTitle = 'Latitude[\xB0]';
  // Latitude[{'\xB0'}]

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{controlTitle}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <LatTextInput
            latMin={latMin}
            latMax={latMax}
            displayValue={localStartValue}
            handleChange={handleSetStart}
            handleBlur={handleBlurStart}
            validationMessage={startMessage}
            label="Start"
            id="textInputStartLat"
            constraintMax={latEnd !== null ? latEnd : undefined}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <LatTextInput
            latMin={latMin}
            latMax={latMax}
            displayValue={localEndValue}
            handleChange={handleSetEnd}
            handleBlur={handleBlurEnd}
            validationMessage={endMessage}
            label="End"
            id="textInputEndLat"
            constraintMin={latStart !== null ? latStart : undefined}
          />
        </Grid>
      </Grid>
      <LatSlider
        latMin={latMin}
        latMax={latMax}
        latEnd={latEnd}
        latStart={latStart}
        handleSlider={handleSlider}
      />
    </React.Fragment>
  );
};

export default LatitudeSubsetControl;
