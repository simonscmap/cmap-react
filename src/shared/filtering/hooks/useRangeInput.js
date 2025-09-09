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

  // Local state for slider preview (drag state)
  const [sliderPreviewStart, setSliderPreviewStart] = useState(null);
  const [sliderPreviewEnd, setSliderPreviewEnd] = useState(null);

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

  // Slider preview handler - updates local state during drag
  const handleSlider = (e, [startValue, endValue]) => {
    setSliderPreviewStart(startValue);
    setSliderPreviewEnd(endValue);
  };

  // Slider commit handler - applies validation and updates canonical store
  const handleSliderCommit = (e, [startValue, endValue]) => {
    const bounds = getEffectiveBounds(min, max, defaultMin, defaultMax);

    // Round and clamp both values
    let roundedStart = roundToStep(startValue, step);
    let roundedEnd = roundToStep(endValue, step);
    const clampedStart = clampValue(roundedStart, bounds.min, bounds.max);
    const clampedEnd = clampValue(roundedEnd, bounds.min, bounds.max);

    // Enforce start <= end invariant
    const finalStart = Math.min(clampedStart, clampedEnd);
    const finalEnd = Math.max(clampedStart, clampedEnd);

    // Update canonical store with same setters as text inputs
    setStart(finalStart);
    setEnd(finalEnd);

    // Clear preview state
    setSliderPreviewStart(null);
    setSliderPreviewEnd(null);
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
    handleSliderCommit,
  };
};

export default useRangeInput;
