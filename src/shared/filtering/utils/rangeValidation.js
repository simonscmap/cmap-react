// Pure utility functions for range validation and manipulation

// Clean floating-point noise from multiplication by imprecise step values
const clean = (n) => Number(n.toFixed(2));

const roundToStep = (value, step = 0.1) => clean(Math.round(value / step) * step);
const floorToStep = (value, step = 0.1) => clean(Math.floor(value / step) * step);
const ceilToStep = (value, step = 0.1) => clean(Math.ceil(value / step) * step);

const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const getEffectiveBounds = (min, max, step = 0.1) => ({
  min: floorToStep(min, step),
  max: ceilToStep(max, step),
});

const getDefaultValue = (isStart, min, max, step = 0.1) => {
  const bounds = getEffectiveBounds(min, max, step);
  return isStart ? bounds.min : bounds.max;
};

export {
  roundToStep,
  floorToStep,
  ceilToStep,
  clampValue,
  getEffectiveBounds,
  getDefaultValue,
};
