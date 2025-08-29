import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { emptyStringOrNumber } from './dateHelpers';
import styles from './styles/subsetControlStyles';

const MonthlyDateSubsetControl = (props) => {
  let { subsetState, setTimeStart, setTimeEnd } = props;

  let { timeStart, timeEnd } = subsetState;

  // handler for the slider
  let handleSlider = (_, value) => {
    let [start, end] = value;
    setTimeStart(start);
    setTimeEnd(end);
  };

  let handleSetStart = (e) => {
    let newStartTime = emptyStringOrNumber(e.target.value);
    setTimeStart(newStartTime);
  };

  let handleSetEnd = (e) => {
    let newEndTime = emptyStringOrNumber(e.target.value);
    setTimeEnd(newEndTime);
  };

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>Month</Typography>
        </Grid>

        {/* Manual Entry for Start Time */}
        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              min: 1,
              max: 12,
              style: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={timeStart}
            onChange={handleSetStart}
          />
        </Grid>

        {/* Manual Entry for End Time */}
        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="number"
            inputProps={{
              min: 1,
              max: 12,
              style: styles.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={timeEnd}
            onChange={handleSetEnd}
          />
        </Grid>
      </Grid>

      {/* Slider Control */}
      <Slider
        min={1}
        max={12}
        value={[timeStart, timeEnd]}
        onChange={handleSlider}
        style={styles.slider}
        marks={new Array(12).fill(0).map((_, i) => ({
          value: i + 1,
          label: i + 1,
        }))}
      />
    </React.Fragment>
  );
};

export default MonthlyDateSubsetControl;
