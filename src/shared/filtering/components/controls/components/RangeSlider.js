import React from 'react';
import { Slider } from '@material-ui/core';
import styles from '../../../styles/subsetControlStyles';
import { roundToStep } from '../../../utils/rangeValidation';
import CustomValueLabel from './CustomValueLabel';

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
}) => {
  // Format min/max values to match step precision
  const formattedMin = roundToStep(min, step);
  const formattedMax = roundToStep(max, step);

  // Use custom formatters if provided, otherwise fall back to default behavior
  const getMarkLabel = (value) => {
    if (formatLabel) {
      return formatLabel(value);
    }
    return `${value}${unit}`;
  };

  const getValueLabel = formatValueLabel || ((value) => `${value}${unit}`);

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
      valueLabelFormat={getValueLabel}
      ValueLabelComponent={CustomValueLabel}
      classes={{
        thumb: styles.sliderThumb,
        markLabel: styles.markLabel,
      }}
      style={styles.slider}
      disabled={disabled}
      marks={[
        {
          value: formattedMin,
          label: getMarkLabel(formattedMin),
        },
        {
          value: formattedMax,
          label: getMarkLabel(formattedMax),
        },
      ]}
    />
  );
};

export default RangeSlider;
