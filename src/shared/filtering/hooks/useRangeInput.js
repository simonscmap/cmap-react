import { useState, useEffect } from 'react';
import {
  roundToStep,
  clampValue,
  getEffectiveBounds,
  getDefaultValue,
  getAbsoluteBounds,
} from '../utils/rangeValidation';

/**
 * Manages:
 * - Local state for text inputs (two-phase updates)
 * - Validation messages with auto-hide
 * - Input validation and constraint enforcement
 * - Handlers for text inputs and slider
 *
 * Note: Validation uses early returns, so only one error displays at a time.
 * To show multiple concurrent errors, refactor to accumulate messages.
 */
const useRangeInput = ({
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
  // Local state for typing values (two-phase updates)
  const [localStartValue, setLocalStartValue] = useState('');
  const [localEndValue, setLocalEndValue] = useState('');

  const [localSliderStart, setLocalSliderStart] = useState(start);
  const [localSliderEnd, setLocalSliderEnd] = useState(end);

  // Validation message state
  const [startMessage, setStartMessage] = useState('');
  const [endMessage, setEndMessage] = useState('');

  // Update local values when committed values change
  useEffect(() => {
    setLocalStartValue(start === null ? '' : String(start));
    setLocalSliderStart(start);
  }, [start]);

  useEffect(() => {
    setLocalEndValue(end === null ? '' : String(end));
    setLocalSliderEnd(end);
  }, [end]);

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
      const bounds = getEffectiveBounds(min, max, step);

      // Handle empty fields - restore to default
      if (isNaN(value) || localValue.trim() === '') {
        const defaultValue = getDefaultValue(isStart, min, max, step);
        setValue(defaultValue);
        // Update local display value immediately
        if (isStart) {
          setLocalStartValue(String(defaultValue));
        } else {
          setLocalEndValue(String(defaultValue));
        }
        showMessage(
          setMessage,
          isStart ? 'Restored to minimum value' : 'Restored to maximum value',
        );
        return;
      }

      // Round to step
      const roundedValue = roundToStep(value, step);
      const absoluteBounds = getAbsoluteBounds(fieldType);

      // Validate against absolute bounds (hard rejection)
      if (absoluteBounds) {
        if (roundedValue < absoluteBounds.min) {
          showMessage(setMessage, `Value cannot be below ${absoluteBounds.min}`);
          if (isStart) {
            setLocalStartValue(start === null ? '' : String(start));
          } else {
            setLocalEndValue(end === null ? '' : String(end));
          }
          return;
        }
        if (roundedValue > absoluteBounds.max) {
          showMessage(setMessage, `Value cannot exceed ${absoluteBounds.max}`);
          if (isStart) {
            setLocalStartValue(start === null ? '' : String(start));
          } else {
            setLocalEndValue(end === null ? '' : String(end));
          }
          return;
        }
      }

      // Text input values can now exceed current slider range (no slider-bound clamping)
      let clampedValue = roundedValue;

      if (!allowInversion) {
        const otherValue = isStart ? end : start;
        if (otherValue !== null) {
          if (isStart && clampedValue > otherValue) {
            // User is modifying start and it exceeds end - clamp start to end
            clampedValue = otherValue;
            setLocalStartValue(String(clampedValue));
            showMessage(
              setMessage,
              `Start value must be less than or equal to end value (${otherValue})`,
            );
          } else if (!isStart && clampedValue < otherValue) {
            // User is modifying end and it's less than start - clamp end to start
            clampedValue = otherValue;
            setLocalEndValue(String(clampedValue));
            showMessage(
              setMessage,
              `End value must be greater than or equal to start value (${otherValue})`,
            );
          }
        }
      }

      if (onExpandEndpoint && fieldType) {
        var endpointFieldName = isStart
          ? fieldType + 'Min'
          : fieldType + 'Max';
        onExpandEndpoint(endpointFieldName, clampedValue);
      }

      setValue(clampedValue);
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

  const bounds = getEffectiveBounds(min, max, step);
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
    handleSliderCommit,
    sliderStart: clampValue(localSliderStart, bounds.min, bounds.max),
    sliderEnd: clampValue(localSliderEnd, bounds.min, bounds.max),
    bounds,
  };
};

export default useRangeInput;
