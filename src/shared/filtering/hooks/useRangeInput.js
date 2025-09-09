import { useState, useEffect } from 'react';
import {
  roundToStep,
  clampValue,
  getEffectiveBounds,
  getDefaultValue,
} from '../utils/rangeValidation';

/**
 * Manages:
 * - Local state for text inputs (two-phase updates)
 * - Validation messages with auto-hide
 * - Input validation and constraint enforcement
 * - Handlers for text inputs and slider
 */
const useRangeInput = ({
  start,
  end,
  setStart,
  setEnd,
  min,
  max,
  defaultMin,
  defaultMax,
  step = 0.1,
}) => {
  // Local state for typing values (two-phase updates)
  const [localStartValue, setLocalStartValue] = useState('');
  const [localEndValue, setLocalEndValue] = useState('');

  // Validation message state
  const [startMessage, setStartMessage] = useState('');
  const [endMessage, setEndMessage] = useState('');

  // Update local values when committed values change
  useEffect(() => {
    setLocalStartValue(start === null ? '' : String(start));
  }, [start]);

  useEffect(() => {
    setLocalEndValue(end === null ? '' : String(end));
  }, [end]);

  // handler for the slider
  const handleSlider = (e, [startValue, endValue]) => {
    setStart(startValue);
    setEnd(endValue);
  };

  // onChange handlers for text inputs - update local state only
  const handleSetStart = (e) => {
    setLocalStartValue(e.target.value);
  };

  const handleSetEnd = (e) => {
    setLocalEndValue(e.target.value);
  };

  // Helper function to show validation message with auto-hide
  const showMessage = (setMessage, message) => {
    setMessage(message);
    setTimeout(() => setMessage(''), 3000);
  };

  // Generic blur handler for both start and end inputs
  const createBlurHandler = (isStart, localValue, setValue, setMessage) => {
    return () => {
      let value = parseFloat(localValue);
      const bounds = getEffectiveBounds(min, max, defaultMin, defaultMax);

      // Handle empty fields - restore to default
      if (isNaN(value) || localValue.trim() === '') {
        const defaultValue = getDefaultValue(
          isStart,
          min,
          max,
          defaultMin,
          defaultMax,
        );
        setValue(defaultValue);
        // Update local display value immediately
        if (isStart) {
          setLocalStartValue(String(defaultValue));
        } else {
          setLocalEndValue(String(defaultValue));
        }
        showMessage(
          setMessage,
          isStart ? 'Restored to min' : 'Restored to max',
        );
        return;
      }

      // Round to step
      const roundedValue = roundToStep(value, step);
      const clampedValue = clampValue(roundedValue, bounds.min, bounds.max);

      // Check if clamping occurred
      if (clampedValue > roundedValue) {
        showMessage(setMessage, `Min is ${bounds.min}`);
      } else if (clampedValue < roundedValue) {
        showMessage(setMessage, `Max is ${bounds.max}`);
      }

      value = clampedValue;

      // Ensure start <= end constraint
      const otherValue = isStart ? end : start;
      if (otherValue !== null) {
        if (isStart && value > otherValue) {
          value = otherValue;
          setLocalStartValue(String(value)); // Immediately update display
          showMessage(setMessage, `Max is ${otherValue}`);
        } else if (!isStart && value < otherValue) {
          value = otherValue;
          setLocalEndValue(String(value)); // Immediately update display
          showMessage(setMessage, `Min is ${otherValue}`);
        }
      }

      setValue(value);
    };
  };

  // Create specific blur handlers using the generic function
  const handleBlurStart = createBlurHandler(
    true,
    localStartValue,
    setStart,
    setStartMessage,
  );

  const handleBlurEnd = createBlurHandler(
    false,
    localEndValue,
    setEnd,
    setEndMessage,
  );

  return {
    localStartValue,
    localEndValue,
    handleSetStart,
    handleSetEnd,
    handleBlurStart,
    handleBlurEnd,
    startMessage,
    endMessage,
    handleSlider,
  };
};

export default useRangeInput;
