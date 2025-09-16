import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import useDateRangeInput from '../../../hooks/useDateRangeInput';
import DateRangeSlider from './DateRangeSlider';
import DateRangeInput from './DateDateInput';

/**
 * Date range subset control component
 * Provides date picker inputs and a slider for selecting date ranges
 * Works directly with Date objects
 */
const DateRangeControl = ({
  title,
  startDate, // Date object
  endDate, // Date object
  setStartDate, // (date) => void
  setEndDate, // (date) => void
  minDate, // Date object
  maxDate, // Date object
  startLabel = 'Start Date',
  endLabel = 'End Date',
}) => {
  // Handle date changes
  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
  } = useDateRangeInput({
    start: startDate,
    end: endDate,
    setStart: setStartDate,
    setEnd: setEndDate,
    min: minDate,
    max: maxDate,
  });

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <DateRangeInput
            minDate={minDate}
            maxDate={maxDate}
            value={startDate}
            onChange={handleStartChange}
            onBlur={handleDateStartBlur}
            validationMessage={startDateMessage}
            label={startLabel}
            id={`dateInputStart${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <DateRangeInput
            minDate={minDate}
            maxDate={maxDate}
            value={endDate}
            onChange={handleEndChange}
            onBlur={handleDateEndBlur}
            validationMessage={endDateMessage}
            label={endLabel}
            id={`dateInputEnd${title.replace(/[^a-zA-Z0-9]/g, '')}`}
          />
        </Grid>
      </Grid>
      <DateRangeSlider
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onStartChange={handleStartChange}
        onEndChange={handleEndChange}
        disabled={minDate === maxDate}
      />
    </React.Fragment>
  );
};

export default DateRangeControl;
