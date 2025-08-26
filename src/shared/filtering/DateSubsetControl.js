import { Grid, Slider, TextField, Typography } from '@material-ui/core';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import React, { useState, useEffect } from 'react';
import {
  dateToDateString,
  dayToDateString,
  emptyStringOrNumber,
  shortenDate,
} from './dateHelpers';
import styles from './styles/subsetControlStyles';

const InvalidInputMessage = (props) => {
  if (!props.message) {
    return '';
  }
  return (
    <div style={styles.messageContainer}>
      <NotInterestedIcon style={styles.prohibitedIcon} />
      <span>{props.message}</span>
      <div style={styles.messageArrow}></div>
    </div>
  );
};

const MonthlyDateControl = (props) => {
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

const DailyDateControl = (props) => {
  let {
    timeMin,
    timeMax,
    subsetState,
    setTimeStart,
    setTimeEnd,
    // New props from the hook
    handleSetStartDate,
    handleSetEndDate,
    validTimeMin,
    validTimeMax,
  } = props;

  // timeStart & timeEnd are integers representing days (not Dates!)
  let { timeStart, timeEnd, maxDays } = subsetState;
  // use updatedTimeMin and updatedTimeMax for controlled input behavior
  let [updatedTimeMin, setUpdatedTimeMin] = useState(dateToDateString(timeMin));
  useEffect(() => {
    const newMin = dayToDateString(timeMin, timeStart);
    setUpdatedTimeMin(newMin);
    // reset to undefined to allow free input
    setTimeout(() => setUpdatedTimeMin(undefined), 5);
  }, [timeStart, timeMin]);

  let [updatedTimeMax, setUpdatedTimeMax] = useState(dateToDateString(timeMax));
  useEffect(() => {
    setUpdatedTimeMax(dayToDateString(timeMin, timeEnd));
    // reset to undefined to allow free input
    setTimeout(() => setUpdatedTimeMax(undefined), 5);
  }, [timeEnd, timeMin]);

  // Wrapper handlers for the date inputs
  const handleStartDateChange = (e) => {
    handleSetStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    handleSetEndDate(e.target.value);
  };

  let handleSlider = (_, value) => {
    let [start, end] = value;
    setTimeStart(start);
    setTimeEnd(end);
  };

  // add labels to the start and end values,
  // and, length allowing, to the midpoint, and quarter values
  let markLabel = (i, length) => {
    if (i === 0) {
      return dayToDateString(timeMin, i);
    }
    if (i === length - 1) {
      return dayToDateString(timeMin, i);
    }
    if (length >= 3 && i === Math.floor(length / 2)) {
      return shortenDate(dayToDateString(timeMin, i));
    }
    if (length >= 5 && i === Math.floor(length / 4)) {
      return shortenDate(dayToDateString(timeMin, i));
    }
    if (length >= 5 && i === Math.floor(length * 0.75)) {
      return shortenDate(dayToDateString(timeMin, i));
    }
    return undefined;
  };

  let getMarks = () => {
    // prevent large datasets from exploding the time slider
    if (maxDays > 365) {
      return [
        { value: 0, label: dayToDateString(timeMin, 0) },
        { value: maxDays, label: dayToDateString(timeMin, maxDays) },
      ];
    }
    return new Array(maxDays + 1).fill(0).map((_, i, arr) => ({
      value: i,
      label: markLabel(i, arr.length),
    }));
  };

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>Date</Typography>
        </Grid>

        <Grid item xs={6} md={4} style={styles.relative}>
          <TextField
            label="Start"
            type="date"
            inputProps={{
              style: styles.input,
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

        <Grid item xs={6} md={4} style={styles.relative}>
          <TextField
            label="End"
            type="date"
            inputProps={{
              style: styles.input,
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
          style={styles.slider}
          step={maxDays < 365 ? null : 1} // disallow values not marked, unless large dataset
          marks={getMarks()}
        />
      </div>
    </React.Fragment>
  );
};

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
