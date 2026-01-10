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
  step = 0.1,
  allowInversion = false,
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

  const validateSliderValues = (startValue, endValue) => {
    const bounds = getEffectiveBounds(min, max, step);

    // Round and clamp both values
    let roundedStart = roundToStep(startValue, step);
    let roundedEnd = roundToStep(endValue, step);
    const clampedStart = clampValue(roundedStart, bounds.min, bounds.max);
    const clampedEnd = clampValue(roundedEnd, bounds.min, bounds.max);

    const finalStart = allowInversion ? clampedStart : Math.min(clampedStart, clampedEnd);
    const finalEnd = allowInversion ? clampedEnd : Math.max(clampedStart, clampedEnd);

    return { finalStart, finalEnd };
  };

  const handleSlider = (e, [startValue, endValue]) => {
    const { finalStart, finalEnd } = validateSliderValues(startValue, endValue);

    setLocalSliderStart(finalStart);
    setLocalSliderEnd(finalEnd);
    setLocalStartValue(String(finalStart));
    setLocalEndValue(String(finalEnd));
  };

  const handleSliderCommit = (e, [startValue, endValue]) => {
    const { finalStart, finalEnd } = validateSliderValues(startValue, endValue);

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
      let clampedValue = clampValue(roundedValue, bounds.min, bounds.max);

      // Check if clamping occurred with clearer messaging
      if (clampedValue > roundedValue) {
        showMessage(
          setMessage,
          `Value cannot be below minimum of ${bounds.min}`,
        );
      } else if (clampedValue < roundedValue) {
        showMessage(
          setMessage,
          `Value cannot be above maximum of ${bounds.max}`,
        );
      }

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
    sliderStart: localSliderStart,
    sliderEnd: localSliderEnd,
  };
};

export default useRangeInput;
