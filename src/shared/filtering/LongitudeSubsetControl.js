import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import styles from '../../features/datasetDownload/styles/downloadDialogStyles';
import logInit from '../../Services/log-service';

const log = logInit('LongitudeSubsetControl').addContext({
  src: 'features/datasetDownload/components/DownloadDialog',
});

const LongitudeControl = (props) => {
  let { classes, dataset, subsetState, setLonStart, setLonEnd } = props;
  let { Lon_Max, Lon_Min } = dataset;
  let { lonStart, lonEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    log.debug('handleSlider', { e: e.target.value, value });
    setLonStart(start);
    setLonEnd(end);
  };

  let emptyStringOrNumber = (val) => {
    return val === '' ? '' : Number(val);
  };

  let handleSetStart = (e) => {
    log.debug('handleSetStart', { value: e.target.value });
    let newLonStart = emptyStringOrNumber(e.target.value);
    setLonStart(newLonStart);
  };

  let handleSetEnd = (e) => {
    log.debug('handleSetEnd', { value: e.target.value });
    let newLonEnd = emptyStringOrNumber(e.target.value);
    setLonEnd(newLonEnd);
  };

  let title = 'Longitude[\xB0]'; // Longitude[{'\xB0'}]

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
              step: 0.1,
              min: Math.floor(Lon_Min * 10) / 10,
              max: Math.ceil(Lon_Max * 10) / 10,
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={lonStart}
            onChange={handleSetStart}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="number"
            inputProps={{
              step: 0.1,
              min: Math.floor(Lon_Min * 10) / 10,
              max: Math.ceil(Lon_Max * 10) / 10,
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={lonEnd}
            onChange={handleSetEnd}
          />
        </Grid>
      </Grid>

      <Slider
        min={Math.floor(Lon_Min * 10) / 10}
        max={Math.ceil(Lon_Max * 10) / 10}
        step={0.1}
        value={[
          typeof lonStart === 'number' ? lonStart : -90,
          typeof lonEnd === 'number' ? lonEnd : 90,
        ]}
        onChange={handleSlider}
        classes={{
          valueLabel: classes.sliderValueLabel,
          thumb: classes.sliderThumb,
          markLabel: classes.markLabel,
        }}
        className={classes.slider}
        disabled={Lon_Min === Lon_Max}
        marks={[
          {
            value: Math.floor(Lon_Min * 10) / 10,
            label: `${Math.floor(Lon_Min * 10) / 10}`,
          },
          {
            value: Math.ceil(Lon_Max * 10) / 10,
            label: `${Math.ceil(Lon_Max * 10) / 10}`,
          },
        ]}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(LongitudeControl);
