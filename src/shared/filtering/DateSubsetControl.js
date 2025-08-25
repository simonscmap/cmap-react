import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import {
  withStyles,
  makeStyles,
  ThemeProvider,
  createTheme,
} from '@material-ui/core/styles';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import React, { useState, useEffect } from 'react';
import { dayToDateString } from '../../features/datasetDownload/utils/downloadDialogHelpers';
import {
  dateToDateString,
  emptyStringOrNumber,
  shortenDate,
} from './dateHelpers';
import styles from './styles/subsetControlStyles';

const WarningTheme = createTheme({
  palette: {
    primary: {
      main: '#d16265;',
    },
    secondary: {
      main: '#ffd54f',
    },
  },
});
const ProhibitedIcon = () => {
  return (
    <ThemeProvider theme={WarningTheme}>
      <NotInterestedIcon color={'primary'} />
    </ThemeProvider>
  );
};

const useMessageStyles = makeStyles(() => ({
  container: {
    position: 'absolute',
    bottom: '45px',
    padding: '5px 10px',
    borderRadius: '5px',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '.5em',
    fontSize: '.9em',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: '-10px',
    borderRight: '5px solid transparent',
    borderLeft: '5px solid transparent',
    borderTop: '10px solid rgba(0,0,0,0.2)',
  },
}));

const InvalidInputMessage = (props) => {
  const cl = useMessageStyles();
  if (!props.message) {
    return '';
  }
  return (
    <div className={cl.container}>
      <ProhibitedIcon />
      <span>{props.message}</span>
      <div className={cl.arrow}></div>
    </div>
  );
};

const MonthlyDateControl = withStyles(styles)((props) => {
  let { classes, subsetState, setTimeStart, setTimeEnd } = props;

  let { timeStart, timeEnd } = subsetState;

  // handler for the slider
  let handleSlider = (e, value) => {
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
        marks={new Array(12).fill(0).map((v, i) => ({
          value: i + 1,
          label: i + 1,
        }))}
      />
    </React.Fragment>
  );
});

/* Daily Date Control

   Date control is a filed with two modes of input: the text input and the slider.

   The state values they are responsible for updating are timeStart and timeEnd,
   which are integers representing ordinal days of the dataset data (for example,
   day 0 is the first day of a cruise).

   The text intput is a type=date input; its emitted value is in the
   form "yyyy-mm-dd", and therefore conversion is needed.

   (In order to construct the eventual sql query in makeSubsetQuery, timeStart and
   timeEnd are converted to a date with dayToDateString; Note that this conversion is
   only specific to the day, and does not contain hour/min/second.)

*/

const DailyDateControl = withStyles(styles)((props) => {
  let {
    classes,
    dataset,
    subsetState,
    setTimeStart,
    setTimeEnd,
    setInvalidFlag,
    // New props from the hook
    handleSetStartDate,
    handleSetEndDate,
    validTimeMin,
    validTimeMax,
  } = props;
  let { Time_Min, Time_Max } = dataset; // Date Objects

  // timeStart & timeEnd are integers representing days (not Dates!)
  let { timeStart, timeEnd, maxDays } = subsetState;
  // use updatedTimeMin and updatedTimeMax for controlled input behavior
  let [updatedTimeMin, setUpdatedTimeMin] = useState(
    dateToDateString(Time_Min),
  );
  useEffect(() => {
    const newMin = dayToDateString(Time_Min, timeStart);
    setUpdatedTimeMin(newMin);
    // reset to undefined to allow free input
    setTimeout(() => setUpdatedTimeMin(undefined), 5);
  }, [timeStart, Time_Min]);

  let [updatedTimeMax, setUpdatedTimeMax] = useState(
    dateToDateString(Time_Max),
  );
  useEffect(() => {
    setUpdatedTimeMax(dayToDateString(Time_Min, timeEnd));
    // reset to undefined to allow free input
    setTimeout(() => setUpdatedTimeMax(undefined), 5);
  }, [timeEnd, Time_Min]);

  // Wrapper handlers for the date inputs
  const handleStartDateChange = (e) => {
    handleSetStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    handleSetEndDate(e.target.value);
  };

  let handleSlider = (e, value) => {
    let [start, end] = value;
    setTimeStart(start);
    setTimeEnd(end);
  };

  // add labels to the start and end values,
  // and, length allowing, to the midpoint, and quarter values
  let markLabel = (i, length) => {
    if (i === 0) {
      return dayToDateString(Time_Min, i);
    }
    if (i === length - 1) {
      return dayToDateString(Time_Min, i);
    }
    if (length >= 3 && i === Math.floor(length / 2)) {
      return shortenDate(dayToDateString(Time_Min, i));
    }
    if (length >= 5 && i === Math.floor(length / 4)) {
      return shortenDate(dayToDateString(Time_Min, i));
    }
    if (length >= 5 && i === Math.floor(length * 0.75)) {
      return shortenDate(dayToDateString(Time_Min, i));
    }
    return undefined;
  };

  let getMarks = () => {
    // prevent large datasets from exploding the time slider
    if (maxDays > 365) {
      return [
        { value: 0, label: dayToDateString(Time_Min, 0) },
        { value: maxDays, label: dayToDateString(Time_Min, maxDays) },
      ];
    }
    return new Array(maxDays + 1).fill(0).map((_, i, arr) => ({
      value: i,
      label: markLabel(i, arr.length),
    }));
  };

  return (
    <React.Fragment>
      <Grid container className={classes.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography className={classes.formLabel}>Date</Typography>
        </Grid>

        <Grid item xs={6} md={4} className={classes.relative}>
          <TextField
            label="Start"
            type="date"
            inputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            error={!validTimeMin}
            value={updatedTimeMin}
            onChange={handleStartDateChange}
          />
          <InvalidInputMessage
            message={validTimeMin ? null : 'Invalid Start Date'}
          />
        </Grid>

        <Grid item xs={6} md={4} className={classes.relative}>
          <TextField
            label="End"
            type="date"
            inputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            error={!validTimeMax}
            value={updatedTimeMax}
            onChange={handleEndDateChange}
          />
          <InvalidInputMessage
            message={validTimeMax ? null : 'Invalid End Date'}
          />
        </Grid>
      </Grid>
      {/* NOTE: to make this a dual slider, pass a tuple as the "value" attribute */}
      <div>
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
          step={maxDays < 365 ? null : 1} // disallow values not marked, unless large dataset
          marks={getMarks()}
        />
      </div>
    </React.Fragment>
  );
});

// render a different date control depending on
// whether the dataset is monthly climatology
const DateSubsetControl = (props) => {
  let { isMonthlyClimatology } = props;
  if (isMonthlyClimatology) {
    return <MonthlyDateControl {...props} />;
  } else {
    return <DailyDateControl {...props} />;
  }
};

export default DateSubsetControl;
