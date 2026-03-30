import { useState, useEffect } from 'react';
import { formatDateToYearMonthDay, dateToUTCDateString } from '../utils/dateHelpers';
import { getFieldLabel, messages } from '../utils/validationMessages';

const validateDateValue = (date, isStart, otherDate, min, max) => {
  let label = getFieldLabel('date', isStart);

  if (date === null) {
    return { valid: false, message: messages.invalidDate(label), blurOnly: true };
  }

  let year = date.getUTCFullYear();
  if (year < 1000) {
    return { valid: false, message: messages.invalidYear(label), blurOnly: false };
  }

  let dateStr = dateToUTCDateString(date);

  if (isStart && min !== undefined && dateStr < dateToUTCDateString(min)) {
    return { valid: true, warning: 'startBefore', blurOnly: false };
  }

  if (!isStart && max !== undefined && dateStr > dateToUTCDateString(max)) {
    return { valid: true, warning: 'endPast', blurOnly: false };
  }

  if (isStart && otherDate !== null) {
    let otherDateStr = dateToUTCDateString(otherDate);
    if (dateStr > otherDateStr) {
      return { valid: false, message: messages.dateRangeInverted(), blurOnly: false };
    }
  }

  return { valid: true, message: '', blurOnly: false };
};

const useMultiDatasetDateRangeInput = ({
  localStart,
  localEnd,
  committedStart,
  committedEnd,
  setStart,
  setEnd,
  min,
  max,
}) => {
  const [startDateMessage, setStartDateMessage] = useState('');
  const [endDateMessage, setEndDateMessage] = useState('');
  const [dateWarning, setDateWarning] = useState('');

  const [startDateValidationState, setStartDateValidationState] = useState('valid');
  const [endDateValidationState, setEndDateValidationState] = useState('valid');

  const [startHasBlurred, setStartHasBlurred] = useState(false);
  const [endHasBlurred, setEndHasBlurred] = useState(false);

  useEffect(() => {
    setStartHasBlurred(false);
  }, [committedStart]);

  useEffect(() => {
    setEndHasBlurred(false);
  }, [committedEnd]);

  useEffect(() => {
    let startResult = validateDateValue(localStart, true, localEnd, min, max);
    let endResult = validateDateValue(localEnd, false, localStart, min, max);

    setStartDateValidationState(startResult.valid ? 'valid' : 'error');
    setEndDateValidationState(endResult.valid ? 'valid' : 'error');

    if (startResult.valid) {
      setStartHasBlurred(false);
    }
    if (endResult.valid) {
      setEndHasBlurred(false);
    }

    if (!startResult.blurOnly || startHasBlurred) {
      setStartDateMessage(startResult.message || '');
    } else {
      setStartDateMessage('');
    }

    if (!endResult.blurOnly || endHasBlurred) {
      setEndDateMessage(endResult.message || '');
    } else {
      setEndDateMessage('');
    }

    let startOutOfBounds = startResult.warning === 'startBefore';
    let endOutOfBounds = endResult.warning === 'endPast';
    let minFormatted = formatDateToYearMonthDay(min);
    let maxFormatted = formatDateToYearMonthDay(max);

    if (startOutOfBounds && endOutOfBounds) {
      setDateWarning(messages.rangePastAvailable(minFormatted, maxFormatted));
    } else if (startOutOfBounds) {
      setDateWarning(messages.startBeforeAvailable(minFormatted));
    } else if (endOutOfBounds) {
      setDateWarning(messages.endPastAvailable(maxFormatted));
    } else {
      setDateWarning('');
    }
  }, [localStart, localEnd, min, max, startHasBlurred, endHasBlurred]);

  const handleDateStartBlur = () => {
    setStartHasBlurred(true);
    if (startDateValidationState !== 'valid') {
      return;
    }
    if (dateToUTCDateString(localStart) !== dateToUTCDateString(committedStart)) {
      setStart(localStart);
    }
  };

  const handleDateEndBlur = () => {
    setEndHasBlurred(true);
    if (endDateValidationState !== 'valid') {
      return;
    }
    if (dateToUTCDateString(localEnd) !== dateToUTCDateString(committedEnd)) {
      setEnd(localEnd);
    }
  };

  const isValid = startDateValidationState === 'valid' && endDateValidationState === 'valid';

  let isDateRangeInverted = false;
  if (localStart !== null && localEnd !== null) {
    let startStr = dateToUTCDateString(localStart);
    let endStr = dateToUTCDateString(localEnd);
    if (startStr > endStr) {
      isDateRangeInverted = true;
    }
  }

  return {
    handleDateStartBlur,
    handleDateEndBlur,
    startDateMessage,
    endDateMessage,
    dateWarning,
    isDateRangeInverted,
    isValid,
  };
};

export default useMultiDatasetDateRangeInput;
