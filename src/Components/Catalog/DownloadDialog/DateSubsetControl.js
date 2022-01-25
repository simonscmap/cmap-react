import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import {
  dateToDay,
  dayToDate,
  getBoundedDateValueFromClickEvent,
  getIsMonthlyClimatology,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';

const MonthlyDateControl = withStyles(styles)((props) => {
  let { classes, subsetState, setTimeStart, setTimeEnd } = props;

  let { timeStart, timeEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
    let [start, end] = value;
    setTimeStart(start);
    setTimeEnd(end);
  };

  let emptyStringOrNumber = (val) => {
    return val === '' ? '' : Number(val);
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
      <Grid container className={classes.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography className={classes.formLabel}>Month</Typography>
        </Grid>

        {/* Manual Entry for Start Time */}
        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="number"
            inputProps={{
              min: 1,
              max: 12,
              className: classes.input,
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
              className: classes.input,
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
        classes={{
          valueLabel: classes.sliderValueLabel,
          thumb: classes.sliderThumb,
          markLabel: classes.markLabel,
        }}
        className={classes.slider}
        marks={[
          {
            value: 1,
            label: '1',
          },
          {
            value: 12,
            label: '12',
          },
        ]}
      />
    </React.Fragment>
  );
});

const DailyDateControl = withStyles(styles)((props) => {
  let { classes, dataset, subsetState, setTimeStart, setTimeEnd } = props;
  let { Time_Min } = dataset;
  let { timeStart, timeEnd, maxDays } = subsetState;

  // handler for the date picker
  let handleSetStartDate = (e) => {
    let target = getBoundedDateValueFromClickEvent(
      e,
      dataset.Time_Min,
      dataset.Time_Max,
    );
    // convert to numeral representing a day of the full dataset
    let newStartDay = dateToDay(dataset.Time_Min, target);
    setTimeStart(newStartDay);
  };

  // handler for the date picker
  let handleSetEndDate = (e) => {
    let target = getBoundedDateValueFromClickEvent(
      e,
      dataset.Time_Min,
      dataset.Time_Max,
    );
    // convert to numeral representing a day of the full dataset
    let newEndDay = dateToDay(dataset.Time_Min, target);
    setTimeEnd(newEndDay);
  };

  let handleSlider = (e, value) => {
    e.preventDefault();
    e.stopPropagation();
    let [start, end] = value;
    setTimeStart(start);
    setTimeEnd(end);
  };

  return (
    <React.Fragment>
      <Grid container className={classes.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography className={classes.formLabel}>Date</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="Start"
            type="date"
            inputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={dayToDate(Time_Min, timeStart)}
            onChange={handleSetStartDate}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <TextField
            label="End"
            type="date"
            inputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            value={dayToDate(Time_Min, timeEnd)}
            onChange={handleSetEndDate}
          />
        </Grid>
      </Grid>
      {/* NOTE: to make this a dual slider, pass a tuple as the "value" attribute */}
      <div
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => e.stopPropagation()}
      >
        <Slider
          min={0}
          max={maxDays}
          value={[timeStart, timeEnd]}
          onChange={handleSlider}
          classes={{
            valueLabel: classes.sliderValueLabel,
            thumb: classes.sliderThumb,
            markLabel: classes.markLabel,
          }}
          className={classes.slider}
          marks={[
            {
              value: 0,
              label: dayToDate(Time_Min, 0),
            },
            {
              value: maxDays,
              label: dayToDate(Time_Min, maxDays),
            },
          ]}
        />
      </div>

    </React.Fragment>
  );
});

// render a different date control depending on
// whether the dataset is monthly climatology
const DateSubsetControl = (props) => {
  let { dataset } = props;
  let isMonthlyClimatology = getIsMonthlyClimatology(
    dataset.Temporal_Resolution,
  );
  if (isMonthlyClimatology) {
    return <MonthlyDateControl {...props} />;
  } else {
    return <DailyDateControl {...props} />;
  }
};

export default DateSubsetControl;
