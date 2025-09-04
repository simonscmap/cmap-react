import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/subsetControlStyles';
import { emptyStringOrNumber } from '../../utils/dateHelpers';

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
  const effectiveMin =
    constraintMin !== undefined
      ? constraintMin
      : isNaN(latMin)
        ? -90
        : Math.floor(latMin * 10) / 10;
  const effectiveMax =
    constraintMax !== undefined
      ? constraintMax
      : isNaN(latMax)
        ? 90
        : Math.ceil(latMax * 10) / 10;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <TextField
        id={id}
        key={id}
        label={label}
        type="number"
        inputProps={{
          step: 0.1,
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
      <Typography
        variant="caption"
        style={{
          fontSize: '0.75rem',
          color: 'white',
          minWidth: '120px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {validationMessage || ''}
      </Typography>
    </div>
  );
};

const LatSlider = ({ latMin, latMax, latStart, latEnd, handleSlider }) => {
  return (
    <Slider
      id="latSlider"
      key="latSlider"
      min={isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10}
      max={isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10}
      step={0.1}
      value={[
        typeof latStart === 'number' ? latStart : -90,
        typeof latEnd === 'number' ? latEnd : 90,
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
          value: Math.floor(latMin * 10) / 10,
          label: `${Math.floor(latMin * 10) / 10}`,
        },
        {
          value: Math.ceil(latMax * 10) / 10,
          label: `${Math.ceil(latMax * 10) / 10}`,
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

  // Helper function to round to step=0.1
  const roundToStep = (value) => {
    return Math.round(value * 10) / 10;
  };

  // Helper function to clamp value between min and max
  const clampValue = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
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

      // Handle empty fields - restore to default
      if (isNaN(value) || localValue.trim() === '') {
        const defaultValue = isStart
          ? isNaN(latMin)
            ? -90
            : Math.floor(latMin * 10) / 10
          : isNaN(latMax)
            ? 90
            : Math.ceil(latMax * 10) / 10;
        setValue(defaultValue);
        showMessage(
          setMessage,
          isStart ? 'Restored to min' : 'Restored to max',
        );
        return;
      }

      // Round to step=0.1
      value = roundToStep(value);

      // Clamp to dataset bounds
      const minBound = isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10;
      const maxBound = isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10;
      const originalAfterRounding = value;
      value = clampValue(value, minBound, maxBound);

      // Check if clamping occurred
      if (value > originalAfterRounding) {
        showMessage(setMessage, `Min is ${minBound}`);
      } else if (value < originalAfterRounding) {
        showMessage(setMessage, `Max is ${maxBound}`);
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
