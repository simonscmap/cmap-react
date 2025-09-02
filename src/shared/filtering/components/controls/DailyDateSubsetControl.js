import { Grid, Slider, Typography } from '@material-ui/core';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import './DatePickerStyles.css';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import React, { useState, useEffect } from 'react';
import {
  dateToDateString,
  dayToDateString,
  shortenDate,
} from '../../utils/dateHelpers';
import styles from '../../styles/subsetControlStyles';

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

const DailyDateSubsetControl = (props) => {
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
  const handleStartDateChange = (date) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      handleSetStartDate(dateString);
    } else {
      handleSetStartDate('');
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      handleSetEndDate(dateString);
    } else {
      handleSetEndDate('');
    }
  };

  // Convert string dates back to Date objects for DatePicker
  const getStartDateValue = () => {
    if (updatedTimeMin) {
      return new Date(updatedTimeMin);
    }
    return null;
  };

  const getEndDateValue = () => {
    if (updatedTimeMax) {
      return new Date(updatedTimeMax);
    }
    return null;
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
          <div style={styles.datePickerWrapper}>
            <label style={{
              ...styles.datePickerLabel,
              color: !validTimeMin ? '#f44336' : 'rgba(0, 0, 0, 0.54)'
            }}>Start</label>
            <DatePicker
              value={getStartDateValue()}
              onChange={handleStartDateChange}
              shouldOpenCalendar={() => false}
              format="MM/dd/yyyy"
              dayPlaceholder="MM"
              monthPlaceholder="DD"
              yearPlaceholder="YYYY"
              className={`custom-date-picker ${!validTimeMin ? 'error' : ''}`}
            />
          </div>
          <InvalidInputMessage
            message={validTimeMin ? null : 'Invalid Start Date'}
          />
        </Grid>

        <Grid item xs={6} md={4} style={styles.relative}>
          <div style={styles.datePickerWrapper}>
            <label style={{
              ...styles.datePickerLabel,
              color: !validTimeMax ? '#f44336' : 'rgba(0, 0, 0, 0.54)'
            }}>End</label>
            <DatePicker
              value={getEndDateValue()}
              onChange={handleEndDateChange}
              shouldOpenCalendar={() => false}
              format="MM/dd/yyyy"
              dayPlaceholder="MM"
              monthPlaceholder="DD"
              yearPlaceholder="YYYY"
              className={`custom-date-picker ${!validTimeMax ? 'error' : ''}`}
            />
          </div>
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

export default DailyDateSubsetControl;
