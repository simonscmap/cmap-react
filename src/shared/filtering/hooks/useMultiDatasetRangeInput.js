import { useState, useEffect } from 'react';
import {
  roundToStep,
  clampValue,
  getEffectiveBounds,
  getAbsoluteBounds,
} from '../utils/rangeValidation';
import { getFieldLabel, messages } from '../utils/validationMessages';

const validateRangeValue = (value, isStart, otherValue, min, max, step, fieldType, allowInversion) => {
  let label = getFieldLabel(fieldType, isStart);
  let trimmed = value.trim();

  if (trimmed === '') {
    return { valid: false, message: messages.required(label), blurOnly: true };
  }
  let isIntermediateEntry = trimmed === '-' || trimmed === '.' || trimmed === '-.' || trimmed === '-0' || trimmed === '0.';
  if (isIntermediateEntry) {
    return { valid: false, message: messages.invalidNumber(label), blurOnly: true };
  }

  let numValue = Number(value);
  if (isNaN(numValue)) {
    return { valid: false, message: messages.invalidNumber(label), blurOnly: false };
  }
  let roundedValue = roundToStep(numValue, step);
  let absoluteBounds = getAbsoluteBounds(fieldType);

  if (absoluteBounds) {
    if (roundedValue < absoluteBounds.min) {
      return { valid: false, message: messages.belowMin(label, absoluteBounds.min), blurOnly: false };
    }
    if (absoluteBounds.max !== undefined && roundedValue > absoluteBounds.max) {
      return { valid: false, message: messages.aboveMax(label, absoluteBounds.max), blurOnly: false };
    }
  }

  if (!allowInversion && isStart && otherValue !== null) {
    let otherNum = typeof otherValue === 'string' ? parseFloat(otherValue) : otherValue;
    if (!isNaN(otherNum) && roundedValue > otherNum) {
      let startLabel = getFieldLabel(fieldType, true);
      let endLabel = getFieldLabel(fieldType, false);
      return { valid: false, message: messages.rangeInverted(startLabel, endLabel), blurOnly: false };
    }
  }

  return { valid: true, message: '', blurOnly: false };
};

const useMultiDatasetRangeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  step = 0.1,
  allowInversion = false,
  fieldType = null,
  onExpandEndpoint = null,
}) => {
  const [localStartValue, setLocalStartValue] = useState('');
  const [localEndValue, setLocalEndValue] = useState('');

  const [localSliderStart, setLocalSliderStart] = useState(start);
  const [localSliderEnd, setLocalSliderEnd] = useState(end);

  const [startMessage, setStartMessage] = useState('');
  const [endMessage, setEndMessage] = useState('');

  const [startValidationState, setStartValidationState] = useState('valid');
  const [endValidationState, setEndValidationState] = useState('valid');

  const [startHasBlurred, setStartHasBlurred] = useState(false);
  const [endHasBlurred, setEndHasBlurred] = useState(false);

  useEffect(() => {
    setLocalStartValue(start === null ? '' : String(start));
    setLocalSliderStart(start);
    setStartHasBlurred(false);
  }, [start]);

  useEffect(() => {
    setLocalEndValue(end === null ? '' : String(end));
    setLocalSliderEnd(end);
    setEndHasBlurred(false);
  }, [end]);

  useEffect(() => {
    let result = validateRangeValue(localStartValue, true, localEndValue, min, max, step, fieldType, allowInversion);
    setStartValidationState(result.valid ? 'valid' : 'error');
    if (result.valid) {
      setStartHasBlurred(false);
    }
    if (!result.blurOnly || startHasBlurred) {
      setStartMessage(result.message);
    } else {
      setStartMessage('');
    }
  }, [localStartValue, localEndValue, min, max, step, fieldType, allowInversion, startHasBlurred]);

  useEffect(() => {
    let result = validateRangeValue(localEndValue, false, localStartValue, min, max, step, fieldType, allowInversion);
    setEndValidationState(result.valid ? 'valid' : 'error');
    if (result.valid) {
      setEndHasBlurred(false);
    }
    if (!result.blurOnly || endHasBlurred) {
      setEndMessage(result.message);
    } else {
      setEndMessage('');
    }
  }, [localEndValue, localStartValue, min, max, step, fieldType, allowInversion, endHasBlurred]);

  const handleSlider = (e, [startValue, endValue]) => {
    const bounds = getEffectiveBounds(min, max, step);

    let newStart = localSliderStart;
    let newEnd = localSliderEnd;

    if (startValue !== localSliderStart) {
      newStart = clampValue(
        roundToStep(startValue, step),
        bounds.min,
        bounds.max,
      );
    }
    if (endValue !== localSliderEnd) {
      newEnd = clampValue(roundToStep(endValue, step), bounds.min, bounds.max);
    }

    const finalStart = allowInversion ? newStart : Math.min(newStart, newEnd);
    const finalEnd = allowInversion ? newEnd : Math.max(newStart, newEnd);

    setLocalSliderStart(finalStart);
    setLocalSliderEnd(finalEnd);
    setLocalStartValue(String(finalStart));
    setLocalEndValue(String(finalEnd));
  };

  const handleSliderCommit = (e, [startValue, endValue]) => {
    const bounds = getEffectiveBounds(min, max, step);

    let newStart = localSliderStart;
    let newEnd = localSliderEnd;

    if (startValue !== localSliderStart) {
      newStart = clampValue(
        roundToStep(startValue, step),
        bounds.min,
        bounds.max,
      );
    }
    if (endValue !== localSliderEnd) {
      newEnd = clampValue(roundToStep(endValue, step), bounds.min, bounds.max);
    }

    const finalStart = allowInversion ? newStart : Math.min(newStart, newEnd);
    const finalEnd = allowInversion ? newEnd : Math.max(newStart, newEnd);

    if (finalStart !== start) {
      setStart(finalStart);
    }
    if (finalEnd !== end) {
      setEnd(finalEnd);
    }
  };

  const handleSetStart = (e) => {
    setLocalStartValue(e.target.value);
  };

  const handleSetEnd = (e) => {
    setLocalEndValue(e.target.value);
  };

  const createBlurHandler = (isStart, localValue, setValue, validationState, setHasBlurred) => {
    return () => {
      setHasBlurred(true);

      if (validationState !== 'valid') {
        return;
      }

      let value = parseFloat(localValue);
      let roundedValue = roundToStep(value, step);

      if (onExpandEndpoint && fieldType) {
        let endpointFieldName = isStart
          ? fieldType + 'Min'
          : fieldType + 'Max';
        onExpandEndpoint(endpointFieldName, roundedValue);
      }

      setValue(roundedValue);
    };
  };

  const handleBlurStart = createBlurHandler(
    true,
    localStartValue,
    setStart,
    startValidationState,
    setStartHasBlurred,
  );

  const handleBlurEnd = createBlurHandler(
    false,
    localEndValue,
    setEnd,
    endValidationState,
    setEndHasBlurred,
  );

  const bounds = getEffectiveBounds(min, max, step);
  const isValid = startValidationState === 'valid' && endValidationState === 'valid';

  let isRangeInverted = false;
  if (!allowInversion) {
    let startNum = parseFloat(localStartValue);
    let endNum = parseFloat(localEndValue);
    if (!isNaN(startNum) && !isNaN(endNum) && startNum > endNum) {
      isRangeInverted = true;
    }
  }

  return {
    localStartValue,
    localEndValue,
    handleSetStart,
    handleSetEnd,
    handleBlurStart,
    handleBlurEnd,
    startMessage,
    endMessage,
    isRangeInverted,
    isValid,
    handleSlider,
    handleSliderCommit,
    sliderStart: clampValue(localSliderStart, bounds.min, bounds.max),
    sliderEnd: clampValue(localSliderEnd, bounds.min, bounds.max),
    bounds,
  };
};

export default useMultiDatasetRangeInput;
