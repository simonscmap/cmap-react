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
    return { valid: false, message: messages.dateBelowMin(label, formatDateToYearMonthDay(min)), blurOnly: false };
  }

  if (!isStart && max !== undefined && dateStr > dateToUTCDateString(max)) {
    return { valid: false, message: messages.dateAboveMax(label, formatDateToYearMonthDay(max)), blurOnly: false };
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
    let result = validateDateValue(localStart, true, localEnd, min, max);
    setStartDateValidationState(result.valid ? 'valid' : 'error');
    if (result.valid) {
      setStartHasBlurred(false);
    }
    if (!result.blurOnly || startHasBlurred) {
      setStartDateMessage(result.message);
    } else {
      setStartDateMessage('');
    }
  }, [localStart, localEnd, min, max, startHasBlurred]);

  useEffect(() => {
    let result = validateDateValue(localEnd, false, localStart, min, max);
    setEndDateValidationState(result.valid ? 'valid' : 'error');
    if (result.valid) {
      setEndHasBlurred(false);
    }
    if (!result.blurOnly || endHasBlurred) {
      setEndDateMessage(result.message);
    } else {
      setEndDateMessage('');
    }
  }, [localEnd, localStart, min, max, endHasBlurred]);

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
    isDateRangeInverted,
    isValid,
  };
};

export default useMultiDatasetDateRangeInput;
