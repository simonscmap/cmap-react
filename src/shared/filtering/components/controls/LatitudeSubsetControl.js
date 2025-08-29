import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React from 'react';
import styles from '../../styles/subsetControlStyles';
import { emptyStringOrNumber } from '../../utils/dateHelpers';

const LatStartTextInput = ({
  latMin,
  latMax,
  latStart,
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
      value={latStart}
      onChange={handleSetStart}
    />
  );
};

const LatEndTextInput = ({ latMin, latMax, classes, latEnd, handleSetEnd }) => {
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
      value={latEnd}
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

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setLatStart(start);
    setLatEnd(end);
  };

  let handleSetStart = (e) => {
    let newLatStart = emptyStringOrNumber(e.target.value);
    setLatStart(newLatStart);
  };

  let handleSetEnd = (e) => {
    let newLatEnd = emptyStringOrNumber(e.target.value);
    setLatEnd(newLatEnd);
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
            latStart={latStart}
            handleSetStart={handleSetStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <LatEndTextInput
            latMin={latMin}
            latMax={latMax}
            latEnd={latEnd}
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
