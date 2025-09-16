import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import useDateRangeInput from '../../../hooks/useDateRangeInput';
import DateRangeSlider from './DateRangeSlider';
import RangeDateInput from './RangeDateInput';
import {
  dayToDateString,
  extractDateFromString,
  dateToDay,
} from '../../../utils/dateHelpers';

/**
 * Date range subset control component
 * Provides date picker inputs and a slider for selecting date ranges
 * Converts day numbers to Date objects for DateRangeSlider
 */
const DateRangeControl = ({
  title,
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  timeMin, // Base date for day number calculations
  startLabel = 'Start Date',
  endLabel = 'End Date',
}) => {
  // Convert day numbers to Date objects for DateRangeSlider
  const dayNumberToDate = (dayNumber, timeMin) => {
    if (dayNumber === null || dayNumber === undefined || !timeMin) return null;
    try {
      const dateString = dayToDateString(timeMin, dayNumber);
      return extractDateFromString(dateString);
    } catch (error) {
      return null;
    }
  };

  const dateToDayNumber = (date, timeMin) => {
    if (!date || !timeMin) return null;
    try {
      return dateToDay(timeMin, date);
    } catch (error) {
      return null;
    }
  };

  // Convert day numbers to Date objects for slider
  const startDate = dayNumberToDate(start, timeMin);
  const endDate = dayNumberToDate(end, timeMin);
  const minDate = dayNumberToDate(min, timeMin);
  const maxDate = dayNumberToDate(max, timeMin);

  // Handle slider date changes - convert back to day numbers
  const handleSliderStartChange = (date) => {
    const dayNumber = dateToDayNumber(date, timeMin);
    setStart(dayNumber);
  };

  const handleSliderEndChange = (date) => {
    const dayNumber = dateToDayNumber(date, timeMin);
    setEnd(dayNumber);
  };

  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  } = useDateRangeInput({
    start,
    end,
    setStart,
    setEnd,
    min,
    max,
    timeMin,
    step: 1,
  });

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeDateInput
            min={min}
            max={max}
            displayValue={start}
            handleChange={(e) => setStart(e.target.value)}
            handleBlur={handleDateStartBlur}
            validationMessage={startDateMessage}
            label={startLabel}
            id={`dateInputStart${title.replace(/[^a-zA-Z0-9]/g, '')}`}
            timeMin={timeMin}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeDateInput
            min={min}
            max={max}
            displayValue={end}
            handleChange={(e) => setEnd(e.target.value)}
            handleBlur={handleDateEndBlur}
            validationMessage={endDateMessage}
            label={endLabel}
            id={`dateInputEnd${title.replace(/[^a-zA-Z0-9]/g, '')}`}
            timeMin={timeMin}
          />
        </Grid>
      </Grid>
      <DateRangeSlider
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onStartChange={handleSliderStartChange}
        onEndChange={handleSliderEndChange}
        disabled={min === max}
      />
    </React.Fragment>
  );
};

export default DateRangeControl;
