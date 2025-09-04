import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/subsetControlStyles';
import { emptyStringOrNumber } from '../../utils/dateHelpers';

const LatStartTextInput = ({
  latMin,
  latMax,
  displayValue,
  handleSetStart,
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
    />
  );
};

const LatEndTextInput = ({
  latMin,
  latMax,
  classes,
  displayValue,
  handleSetEnd,
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
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <LatEndTextInput
            latMin={latMin}
            latMax={latMax}
            displayValue={localEndValue}
            handleSetEnd={handleSetEnd}
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
