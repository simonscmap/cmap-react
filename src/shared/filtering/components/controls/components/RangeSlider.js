import React from 'react';
import { Slider } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import { floorToStep, ceilToStep } from '../../../utils/rangeValidation';

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
  formatLabel,
  formatValueLabel,
  showMarks = true,
}) => {
  const formattedMin = floorToStep(min, step);
  const formattedMax = ceilToStep(max, step);

  const getMarkLabel = (value) => {
    if (formatLabel) {
      return formatLabel(value);
    }
    return `${value}${unit}`;
  };

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
      valueLabelDisplay="off"
      style={styles.slider}
      disabled={disabled}
      marks={
        showMarks
          ? [
              {
                value: formattedMin,
                label: getMarkLabel(formattedMin),
              },
              {
                value: formattedMax,
                label: getMarkLabel(formattedMax),
              },
            ]
          : false
      }
    />
  );
};

export default RangeSlider;
