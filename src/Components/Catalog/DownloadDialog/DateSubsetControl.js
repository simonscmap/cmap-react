import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import { withStyles, makeStyles, ThemeProvider, createTheme } from '@material-ui/core/styles';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import React, { useState, useEffect } from 'react';
import {
  dateToDay,
  dayToDateString,
  dateToDateString,
  getIsMonthlyClimatology,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';

// convert a date string like "2007-04-09" to "4/9"
let shortenDate = (str) =>
  str
    .split('-')
    .slice(1)
    .map((n) => parseInt(n, 10))
    .join('/');

const WarningTheme = createTheme({
  palette: {
    primary: {
      main: "#d16265;",
    },
    secondary: {
      main: "#ffd54f",
    }
  },
});
const ProhibitedIcon = () => {
  return (<ThemeProvider theme={WarningTheme}>
    <NotInterestedIcon color={'primary'} />
  </ThemeProvider >
  );
}

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
    borderTop: '10px solid rgba(0,0,0,0.2)'
  },
}))

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
  let { classes, dataset, subsetState, setTimeStart, setTimeEnd, setInvalidFlag } = props;
  let { Time_Min, Time_Max } = dataset; // Date Objects

  // timeStart & timeEnd are integers representing days (not Dates!)
  // dayToDateString
  let { timeStart, timeEnd, maxDays } = subsetState;

  const dateIsWithinBounds = (date) => {
    let tmin = dateToDateString (Time_Min); // compare the DAY, not the to the full Date Time
    let tmax = dateToDateString (Time_Max); // ditto
    let d = dateToDateString (date);
    let result = d < tmin
                      ? false
                      : d > tmax
                             ? false
                             : true;
    console.log('date is within range', { date, tmin, tmax, result });
    return result;
  };

  // control state can diverge if it is invalid
  let [validMin, setValidMin] = useState(true);
  let [validMax, setValidMax] = useState(true);

  const setMinValidity = (b) => {
    setValidMin (b);
    if (validMax) { // don't update flag if other control is invalid
      setInvalidFlag (!b); // report valid/invalid control state
    }
  };
  const setMaxValidity = (b) => {
    setValidMax (b);
    if (validMin) { // don't update flag if other control is invalid
      setInvalidFlag (!b); // report valid/invalid control state
    }
  }
  // use updatedTimeMin an an intermediate value to negotiate
  // updates to the date field based timeMin


  // Time Min
  let [updatedTimeMin, setUpdatedTimeMin] = useState(dateToDateString(Time_Min));
  useEffect(() => {
    console.log (`updating local timeStart from parent state`, Time_Min, timeStart)
    // this variable is passed as the "value" attribute
    // to the time field
    const newMin = dayToDateString (Time_Min, timeStart);
    setUpdatedTimeMin (newMin);
    setMinValidity (true);

    // resetting it to undefined will switch the filed to "uncontrolled"
    // allowing the input to change freely, until we next decide to update it
    setTimeout(() => setUpdatedTimeMin(undefined), 5)
  }, [timeStart]);

  // Time Max
  let [updatedTimeMax, setUpdatedTimeMax] = useState(dateToDateString(Time_Max));
  // console.log('updatedTimeMax', updatedTimeMax, timeEnd);
  useEffect(() => {
    console.log (`updating local timeEnd from parent state`, timeEnd)
    // this variable is passed as the "value" attribute
    // to the time field
    setUpdatedTimeMax(dayToDateString(Time_Min, timeEnd));
    setMaxValidity (true);
    // resetting it to undefined will switch the filed to "uncontrolled"
    // allowing the input to change freely, until we next decide to update it
    setTimeout(() => setUpdatedTimeMax(undefined), 5);
  }, [timeEnd]);


  const extractDateFromString = (stringDate) => {
    let [year, month, day] = stringDate.split('-');
    const date = new Date(year, parseInt(month) - 1, day);
    return date;
  };

  // handler for the date picker
  let handleSetStartDate = (e) => {
    if (!e.target.value) {
      console.error('no target value in event; expected a string representing a date;');
      setMinValidity (false);
      return;
    }

    let date = extractDateFromString(e.target.value);

    let shouldUpdate = dateIsWithinBounds(date);

    // convert to numeral representing a day of the full dataset
    if (shouldUpdate) {
      let newStartDay = dateToDay(dataset.Time_Min, date);
      setTimeStart(newStartDay);
      setMinValidity (true);
    } else {
      setMinValidity(false);
      console.log ('will not update start date', date, Time_Min);
    }
  };


  // handler for the date picker
  let handleSetEndDate = (e) => {
    if (!e.target.value) {
      console.error('no target value in event; expected a string representing a date;');
      setMaxValidity(false);
      return;
    }

    let date = extractDateFromString(e.target.value);

    let shouldUpdate = dateIsWithinBounds(date);

    // convert to numeral representing a day of the full dataset
    if (shouldUpdate) {
      let newEndDay = dateToDay(dataset.Time_Min, date);
      setTimeEnd(newEndDay);
      setMaxValidity(true);
    } else {
      setMaxValidity(false);
      console.log('will not update end date', date, Time_Max);
    }
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
    // prevent lange datasets from exploding the time slider
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
            error={!validMin}
            // defaultValue={dayToDateString(Time_Min, timeStart)}
            // value={dayToDateString(Time_Min, timeStart)}
            value={updatedTimeMin}
            onChange={handleSetStartDate}
          />
          <InvalidInputMessage message={validMin ? null : 'Invalid Start Date'} />
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
            error={!validMax}
            value={updatedTimeMax}
            onChange={handleSetEndDate}
          />
          <InvalidInputMessage message={validMax ? null : 'Invalid End Date'} />
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
