import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from './downloadDialogStyles';

const LatStartTextInput = ({
  Lat_Min,
  Lat_Max,
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
  );
};

const LatEndTextInput = ({
  Lat_Min,
  Lat_Max,
  classes,
  latEnd,
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
  );
};

const LatSlider = ({
  Lat_Min,
  Lat_Max,
  latStart,
  latEnd,
  handleSlider,
  classes,
}) => {
  return (
    <Slider
      id="latSlider"
      key="latSlider"
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
  );
};

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
          <LatStartTextInput
            Lat_Min={Lat_Min}
            Lat_Max={Lat_Max}
            latStart={latStart}
            handleSetStart={handleSetStart}
            classes={classes}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <LatEndTextInput
            Lat_Min={Lat_Min}
            Lat_Max={Lat_Max}
            latEnd={latEnd}
            handleSetEnd={handleSetEnd}
            classes={classes}
          />
        </Grid>
      </Grid>
      <LatSlider
        Lat_Min={Lat_Min}
        Lat_Max={Lat_Max}
        latEnd={latEnd}
        latStart={latStart}
        handleSlider={handleSlider}
        classes={classes}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(LatitudeSubsetControl);
