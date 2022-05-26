import React from 'react';
import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';

const DepthSubsetControl = (props) => {
  let { classes, dataset, subsetState, setDepthStart, setDepthEnd } = props;
  let { Depth_Min, Depth_Max } = dataset;
  let { depthStart, depthEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setDepthStart(start);
    setDepthEnd(end);
  };

  let emptyStringOrNumber = (val) => {
    return val === '' ? '' : Number(val);
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
  if (!Depth_Max || Depth_Min === Depth_Max) {
    return '';
  }

  return (
    <React.Fragment>
      <Grid container className={classes.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography className={classes.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              min: Math.floor(Depth_Min),
              max: Math.ceil(Depth_Max),
              className: classes.input,
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
              min: Math.floor(Depth_Min),
              max: Math.ceil(Depth_Max),
              className: classes.input,
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
        min={Math.floor(Depth_Min)}
        max={Math.ceil(Depth_Max)}
        value={[
          typeof depthStart === 'number' ? depthStart : -90,
          typeof depthEnd === 'number' ? depthEnd : 90,
        ]}
        onChange={handleSlider}
        classes={{
          valueLabel: classes.sliderValueLabel,
          thumb: classes.sliderThumb,
          markLabel: classes.markLabel,
        }}
        className={classes.slider}
        marks={[
          {
            value: Math.floor(Depth_Min),
            label: `${Math.floor(Depth_Min)}`,
          },
          {
            value: Math.ceil(Depth_Max),
            label: `${Math.ceil(Depth_Max)}`,
          },
        ]}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(DepthSubsetControl);
