// Pure utility functions for range validation and manipulation

// Clean floating-point noise from multiplication by imprecise step values
const clean = (n) => Number(n.toFixed(2));

// Round division result to avoid floating-point precision issues before floor/ceil
const cleanDivide = (value, step) => {
  const divided = value / step;
  const rounded = Math.round(divided);
  return Math.abs(divided - rounded) < 1e-9 ? rounded : divided;
};

const roundToStep = (value, step = 0.1) =>
  clean(Math.round(cleanDivide(value, step)) * step);
const floorToStep = (value, step = 0.1) =>
  clean(Math.floor(cleanDivide(value, step)) * step);
const ceilToStep = (value, step = 0.1) =>
  clean(Math.ceil(cleanDivide(value, step)) * step);

const clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const ABSOLUTE_BOUNDS = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
  lat: { min: -90, max: 90 },
  lon: { min: -180, max: 180 },
  depth: { min: 0 },
};

const getAbsoluteBounds = (fieldType) => {
  if (!fieldType || !ABSOLUTE_BOUNDS[fieldType]) {
    return null;
  }
  return ABSOLUTE_BOUNDS[fieldType];
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
  ABSOLUTE_BOUNDS,
  getAbsoluteBounds,
  getEffectiveBounds,
  getDefaultValue,
};
