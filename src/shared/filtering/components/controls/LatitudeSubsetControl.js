import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/subsetControlStyles';
import { emptyStringOrNumber } from '../../utils/dateHelpers';

const LatStartTextInput = ({
  latMin,
  latMax,
  displayValue,
  handleSetStart,
  handleBlurStart,
  classes,
}) => {
  return (
    <TextField
      id="textInputStartLat"
      key="textInputStartLat"
      label="Start"
      type="number"
      inputProps={{
        step: 0.1,
        min: isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10,
        max: isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10,
        className: styles.input,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      value={displayValue}
      onChange={handleSetStart}
      onBlur={handleBlurStart}
    />
  );
};

const LatEndTextInput = ({
  latMin,
  latMax,
  classes,
  displayValue,
  handleSetEnd,
  handleBlurEnd,
}) => {
  return (
    <TextField
      id="textInputEndLat"
      key="textInputEndLat"
      label="End"
      type="number"
      inputProps={{
        step: 0.1,
        min: isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10,
        max: isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10,
        className: styles.input,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      value={displayValue}
      onChange={handleSetEnd}
      onBlur={handleBlurEnd}
    />
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

  // onBlur handlers for committing values with validation, rounding, and clamping
  let handleBlurStart = () => {
    let value = parseFloat(localStartValue);

    // Handle empty fields - restore to minimum
    if (isNaN(value) || localStartValue.trim() === '') {
      const defaultValue = isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10;
      setLatStart(defaultValue);
      return;
    }

    // Round to step=0.1
    value = roundToStep(value);

    // Clamp to dataset bounds
    const minBound = isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10;
    const maxBound = isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10;
    value = clampValue(value, minBound, maxBound);

    // Ensure start <= end constraint
    if (latEnd !== null && value > latEnd) {
      value = latEnd;
    }

    setLatStart(value);
  };

  let handleBlurEnd = () => {
    let value = parseFloat(localEndValue);

    // Handle empty fields - restore to maximum
    if (isNaN(value) || localEndValue.trim() === '') {
      const defaultValue = isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10;
      setLatEnd(defaultValue);
      return;
    }

    // Round to step=0.1
    value = roundToStep(value);

    // Clamp to dataset bounds
    const minBound = isNaN(latMin) ? -90 : Math.floor(latMin * 10) / 10;
    const maxBound = isNaN(latMax) ? 90 : Math.ceil(latMax * 10) / 10;
    value = clampValue(value, minBound, maxBound);

    // Ensure start <= end constraint
    if (latStart !== null && value < latStart) {
      value = latStart;
    }

    setLatEnd(value);
  };

  let controlTitle = 'Latitude[\xB0]';
  // Latitude[{'\xB0'}]

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{controlTitle}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <LatStartTextInput
            latMin={latMin}
            latMax={latMax}
            displayValue={localStartValue}
            handleSetStart={handleSetStart}
            handleBlurStart={handleBlurStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <LatEndTextInput
            latMin={latMin}
            latMax={latMax}
            displayValue={localEndValue}
            handleSetEnd={handleSetEnd}
            handleBlurEnd={handleBlurEnd}
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
