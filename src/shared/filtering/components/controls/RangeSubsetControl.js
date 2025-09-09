import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import styles from '../../styles/subsetControlStyles';
import useRangeInput from '../../hooks/useRangeInput';
import RangeTextInput from './components/RangeTextInput';
import RangeSlider from './components/RangeSlider';

/**
 * Generic range subset control that can be used for latitude, longitude, depth, etc.
 * Combines the useRangeInput hook with RangeTextInput and RangeSlider components.
 */
const RangeSubsetControl = ({
  title,
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  defaultMin,
  defaultMax,
  step = 0.1,
  unit = '',
  startLabel = 'Start',
  endLabel = 'End',
}) => {
  const {
    localStartValue,
    localEndValue,
    handleSetStart,
    handleSetEnd,
    handleBlurStart,
    handleBlurEnd,
    startMessage,
    endMessage,
    handleSlider,
    handleSliderCommit,
    sliderStart,
    sliderEnd,
  } = useRangeInput({
    start,
    end,
    setStart,
    setEnd,
    min,
    max,
    defaultMin,
    defaultMax,
    step,
  });

  return (
    <React.Fragment>
      <Grid container style={styles.formGrid}>
        <Grid item xs={12} md={4}>
          <Typography style={styles.formLabel}>{title}</Typography>
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeTextInput
            min={min}
            max={max}
            displayValue={localStartValue}
            handleChange={handleSetStart}
            handleBlur={handleBlurStart}
            validationMessage={startMessage}
            label={startLabel}
            id={`textInputStart${title.replace(/[^a-zA-Z0-9]/g, '')}`}
            step={step}
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <RangeTextInput
            min={min}
            max={max}
            displayValue={localEndValue}
            handleChange={handleSetEnd}
            handleBlur={handleBlurEnd}
            validationMessage={endMessage}
            label={endLabel}
            id={`textInputEnd${title.replace(/[^a-zA-Z0-9]/g, '')}`}
            step={step}
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
        step={step}
        disabled={min === max}
        unit={unit}
      />
    </React.Fragment>
  );
};

export default RangeSubsetControl;
