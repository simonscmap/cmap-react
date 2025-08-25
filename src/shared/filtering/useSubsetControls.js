import { useState } from 'react';
import useSubsetFiltering from './useSubsetFiltering';

/**
 * Custom hook for managing subset control state and logic
 * Wrapper around useSubsetFiltering that adds UI-specific functionality
 *
 * @param {Object} dataset - Dataset object containing metadata
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeOptionsState - Whether to manage options toggle state
 * @param {Object} options.initialOptions - Initial options state values
 * @returns {Object} Subset controls state and handlers
 */
const useSubsetControls = (dataset, options = {}) => {
  const { includeOptionsState = true, initialOptions = { subset: false } } =
    options;

  // Use the pure filtering hook for all filtering logic
  const filteringHook = useSubsetFiltering(dataset);

  // UI-specific state (options toggle)
  const [optionsState, setOptionsState] = useState(initialOptions);

  // Options switch handler (UI-specific logic)
  const handleSwitch = (event) => {
    setOptionsState((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  return {
    // Spread all functionality from the pure filtering hook
    ...filteringHook,

    // Add UI-specific functionality (options state) if enabled
    ...(includeOptionsState && {
      optionsState,
      handleSwitch,
      setOptionsState,
    }),
  };
};

export default useSubsetControls;
