const fieldLabels = {
  latStart: 'S Latitude',
  latEnd: 'N Latitude',
  lonStart: 'W Longitude',
  lonEnd: 'E Longitude',
  depthStart: 'Min Depth',
  depthEnd: 'Max Depth',
  dateStart: 'Start Date',
  dateEnd: 'End Date',
};

const getFieldLabel = (fieldType, isStart) => {
  let key = fieldType + (isStart ? 'Start' : 'End');
  return fieldLabels[key] || 'Value';
};

const isIntermediateSigned = (v) => {
  let s = String(v).trim();
  return s === '' || s === '-' || s === '.' || s === '-.' || s === '-0' || s === '0.';
};

const isIntermediateUnsigned = (v) => {
  let s = String(v).trim();
  return s === '' || s === '.' || s === '0.';
};

const messages = {
  required: (label) => `${label} is required`,
  invalidNumber: (label) => `${label}: Enter a valid number`,
  invalidDate: (label) => `${label}: Enter a valid date`,
  invalidYear: (label) => `${label}: Year must be 4 digits`,
  belowMin: (label, min) => {
    if (min === 0) {
      return `${label} cannot be negative`;
    }
    return `${label} must be ${min} or greater`;
  },
  aboveMax: (label, max) => `${label} must be ${max} or less`,
  rangeInverted: (startLabel, endLabel) => `${startLabel} must be less than ${endLabel}`,
  dateBelowMin: (label, minDate) => `${label} must be ${minDate} or later`,
  dateAboveMax: (label, maxDate) => `${label} must be ${maxDate} or earlier`,
  dateRangeInverted: () => `Start Date must be before End Date`,
  startBeforeAvailable: (minDate) => `Start date before data start (${minDate}). Results unaffected.`,
  endPastAvailable: (maxDate) => `End date past data end (${maxDate}). Results unaffected.`,
  rangePastAvailable: (minDate, maxDate) => `Date range outside available data (${minDate}–${maxDate}). Results unaffected.`,
};

export { fieldLabels, getFieldLabel, messages, isIntermediateSigned, isIntermediateUnsigned };
