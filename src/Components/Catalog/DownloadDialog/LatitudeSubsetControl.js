import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';

const LatitudeSubsetControl = (props) => {
  let { classes, dataset, subsetState, setLatStart, setLatEnd } = props;
  let { Lat_Max, Lat_Min } = dataset;
  let { latStart, latEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setLatStart(start);
    setLatEnd(end);
  };

  let emptyStringOrNumber = (val) => {
    return val === '' ? '' : Number(val);
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
      <Grid container className={classes.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography className={classes.formLabel}>{controlTitle}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              step: 0.1,
              min: Math.floor(Lat_Min * 10) / 10,
              max: Math.ceil(Lat_Max * 10) / 10,
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={latStart}
            onChange={handleSetStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="number"
            inputProps={{
              step: 0.1,
              min: Math.floor(Lat_Min * 10) / 10,
              max: Math.ceil(Lat_Max * 10) / 10,
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={latEnd}
            onChange={handleSetEnd}
          />
        </Grid>
      </Grid>

      <Slider
        min={Math.floor(Lat_Min * 10) / 10}
        max={Math.ceil(Lat_Max * 10) / 10}
        step={0.1}
        value={[
          typeof latStart === 'number' ? latStart : -90,
          typeof latEnd === 'number' ? latEnd : 90,
        ]}
        onChange={handleSlider}
        classes={{
          valueLabel: classes.sliderValueLabel,
          thumb: classes.sliderThumb,
          markLabel: classes.markLabel,
        }}
        className={classes.slider}
        disabled={Lat_Min === Lat_Max}
        marks={[
          {
            value: Math.floor(Lat_Min * 10) / 10,
            label: `${Math.floor(Lat_Min * 10) / 10}`,
          },
          {
            value: Math.ceil(Lat_Max * 10) / 10,
            label: `${Math.ceil(Lat_Max * 10) / 10}`,
          },
        ]}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(LatitudeSubsetControl);
