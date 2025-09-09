import React from 'react';
import { Slider } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';

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
  return (
    <Slider
      id="rangeSlider"
      min={min}
      max={max}
      step={step}
      value={[
        typeof start === 'number' ? start : min,
        typeof end === 'number' ? end : max,
      ]}
      onChange={handleSlider}
      onChangeCommitted={handleSliderCommit}
      classes={{
        valueLabel: styles.sliderValueLabel,
        thumb: styles.sliderThumb,
        markLabel: styles.markLabel,
      }}
      style={styles.slider}
      disabled={disabled}
      marks={[
        {
          value: min,
          label: `${min}${unit}`,
        },
        {
          value: max,
          label: `${max}${unit}`,
        },
      ]}
    />
  );
};

export default RangeSlider;
