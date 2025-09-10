import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import useDateRangeInput from '../../../hooks/useDateRangeInput';
import { RangeDateInput, RangeSlider } from '../components';

/**
 * Date range subset control component
 * Provides date picker inputs and a slider for selecting date ranges
 * Works with day number values internally while displaying formatted dates to users
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
  const {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
    handleSlider,
    handleSliderCommit,
    sliderStart,
    sliderEnd,
    formatSliderLabel,
    formatSliderValueLabel,
  } = useDateRangeInput({
    start,
    end,
    setStart,
    setEnd,
    min,
    max,
    timeMin, // Pass timeMin to the hook
    step: 1, // Days are discrete units
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
      <RangeSlider
        min={min}
        max={max}
        start={sliderStart}
        end={sliderEnd}
        handleSlider={handleSlider}
        handleSliderCommit={handleSliderCommit}
        step={1}
        disabled={min === max}
        unit=""
        formatLabel={formatSliderLabel}
        formatValueLabel={formatSliderValueLabel}
      />
    </React.Fragment>
  );
};

export default DateRangeControl;
