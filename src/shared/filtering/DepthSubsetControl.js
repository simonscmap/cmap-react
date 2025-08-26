import React from 'react';
import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import styles from './styles/subsetControlStyles';
import { emptyStringOrNumber } from './dateHelpers';

const DepthSubsetControl = (props) => {
  let { depthMin, depthMax, subsetState, setDepthStart, setDepthEnd } = props;
  let { depthStart, depthEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setDepthStart(start);
    setDepthEnd(end);
  };

  let handleSetStart = (e) => {
    let newDepthStart = emptyStringOrNumber(e.target.value);
    setDepthStart(newDepthStart);
  };

  let handleSetEnd = (e) => {
    let newDepthEnd = emptyStringOrNumber(e.target.value);
    setDepthEnd(newDepthEnd);
  };

  let title = 'Depth[m]';

  // do not render controls if dataset has no depth
  // or if depth is static
  if (!depthMax || depthMin === depthMax) {
    return '';
  }

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              min: Math.floor(depthMin),
              max: Math.ceil(depthMax),
              className: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={depthStart}
            onChange={handleSetStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="number"
            inputProps={{
              min: Math.floor(depthMin),
              max: Math.ceil(depthMax),
              className: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={depthEnd}
            onChange={handleSetEnd}
          />
        </Grid>
      </Grid>

      <Slider
        min={Math.floor(depthMin)}
        max={Math.ceil(depthMax)}
        value={[
          typeof depthStart === 'number' ? depthStart : -90,
          typeof depthEnd === 'number' ? depthEnd : 90,
        ]}
        onChange={handleSlider}
        classes={{
          valueLabel: styles.sliderValueLabel,
          thumb: styles.sliderThumb,
          markLabel: styles.markLabel,
        }}
        style={styles.slider}
        marks={[
          {
            value: Math.floor(depthMin),
            label: `${Math.floor(depthMin)}`,
          },
          {
            value: Math.ceil(depthMax),
            label: `${Math.ceil(depthMax)}`,
          },
        ]}
      />
    </React.Fragment>
  );
};

export default DepthSubsetControl;
