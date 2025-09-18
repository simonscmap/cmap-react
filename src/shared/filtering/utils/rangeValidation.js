// Pure utility functions for range validation and manipulation
// Extracted from LatitudeSubsetControl.js lines 6-26

const roundToStep = (value, step = 0.1) => {
  const factor = 1 / step;
  return Math.round(value * factor) / factor;
};

const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const getEffectiveBounds = (min, max, step = 0.1) => ({
  min: roundToStep(min, step),
  max: roundToStep(max, step),
});

const getDefaultValue = (isStart, min, max, step = 0.1) => {
  const bounds = getEffectiveBounds(min, max, step);
  return isStart ? bounds.min : bounds.max;
};

export { roundToStep, clampValue, getEffectiveBounds, getDefaultValue };
