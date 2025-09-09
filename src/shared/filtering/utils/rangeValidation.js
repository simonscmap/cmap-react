// Pure utility functions for range validation and manipulation
// Extracted from LatitudeSubsetControl.js lines 6-26

const roundToStep = (value, step = 0.1) => {
  return Math.round(value / step) * step;
};

const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const getEffectiveBounds = (min, max, defaultMin, defaultMax) => ({
  min: isNaN(min) ? defaultMin : Math.floor(min * 10) / 10,
  max: isNaN(max) ? defaultMax : Math.ceil(max * 10) / 10,
});

const getDefaultValue = (isStart, min, max, defaultMin, defaultMax) => {
  const bounds = getEffectiveBounds(min, max, defaultMin, defaultMax);
  return isStart ? bounds.min : bounds.max;
};

export { roundToStep, clampValue, getEffectiveBounds, getDefaultValue };
