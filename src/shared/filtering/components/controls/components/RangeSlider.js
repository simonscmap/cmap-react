import React from 'react';
import { Slider } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import { roundToStep } from '../../../utils/rangeValidation';

const RangeSlider = ({
  min,
  max,
  start,
  end,
  handleSlider,
  handleSliderCommit,
  step = 0.1,
  disabled = false,
  unit = '',
}) => {
  // Format min/max values to match step precision
  const formattedMin = roundToStep(min, step);
  const formattedMax = roundToStep(max, step);

  return (
    <Slider
      id="rangeSlider"
      min={formattedMin}
      max={formattedMax}
      step={step}
      value={[
        typeof start === 'number' ? start : formattedMin,
        typeof end === 'number' ? end : formattedMax,
      ]}
      onChange={handleSlider}
      onChangeCommitted={handleSliderCommit}
      valueLabelDisplay="auto"
      classes={{
        valueLabel: styles.sliderValueLabel,
        thumb: styles.sliderThumb,
        markLabel: styles.markLabel,
      }}
      style={styles.slider}
      disabled={disabled}
      marks={[
        {
          value: formattedMin,
          label: `${formattedMin}${unit}`,
        },
        {
          value: formattedMax,
          label: `${formattedMax}${unit}`,
        },
      ]}
    />
  );
};

export default RangeSlider;
