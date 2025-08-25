import { useState, useMemo } from 'react';
import {
  dateToDateString,
  dateToDay,
  extractDateFromString,
  getIsMonthlyClimatology,
  getInitialRangeValues,
} from './dateHelpers';

/**
 * Custom hook for managing subset control state and logic
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

  // Get initial range values from dataset
  const { maxDays, lat, lon, time, depth } = useMemo(() => {
    return dataset
      ? getInitialRangeValues(dataset)
      : {
          maxDays: 0,
          lat: { start: 0, end: 0 },
          lon: { start: 0, end: 0 },
          time: { start: 0, end: 0 },
          depth: { start: 0, end: 0 },
        };
  }, [dataset]);

  // State for subset parameters
  const [latStart, setLatStart] = useState(lat.start);
  const [latEnd, setLatEnd] = useState(lat.end);
  const [lonStart, setLonStart] = useState(lon.start);
  const [lonEnd, setLonEnd] = useState(lon.end);
  const [timeStart, setTimeStart] = useState(time.start);
  const [timeEnd, setTimeEnd] = useState(time.end);
  const [depthStart, setDepthStart] = useState(depth.start);
  const [depthEnd, setDepthEnd] = useState(depth.end);

  // Options state (optional)
  const [optionsState, setOptionsState] = useState(initialOptions);
  const [isInvalid, setInvalidFlag] = useState(false);

  // Date validation state
  const [validTimeMin, setValidTimeMin] = useState(true);
  const [validTimeMax, setValidTimeMax] = useState(true);

  // Date validation functions
  const dateIsWithinBounds = useMemo(() => {
    if (!dataset?.Time_Min || !dataset?.Time_Max) return () => true;

    return (date) => {
      const tmin = dateToDateString(dataset.Time_Min);
      const tmax = dateToDateString(dataset.Time_Max);
      const d = dateToDateString(date);
      return d >= tmin && d <= tmax;
    };
  }, [dataset?.Time_Min, dataset?.Time_Max]);

  const setTimeMinValidity = (isValid) => {
    setValidTimeMin(isValid);
    if (validTimeMax) {
      setInvalidFlag(!isValid);
    }
  };

  const setTimeMaxValidity = (isValid) => {
    setValidTimeMax(isValid);
    if (validTimeMin) {
      setInvalidFlag(!isValid);
    }
  };

  // Date handlers for text inputs
  const handleSetStartDate = (value) => {
    if (!value) {
      setTimeMinValidity(false);
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date);

    if (shouldUpdate && dataset?.Time_Min) {
      const newStartDay = dateToDay(dataset.Time_Min, date);
      setTimeStart(newStartDay);
      setTimeMinValidity(true);
    } else {
      setTimeMinValidity(false);
    }
  };

  const handleSetEndDate = (value) => {
    if (!value) {
      setTimeMaxValidity(false);
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date);

    if (shouldUpdate && dataset?.Time_Min) {
      const newEndDay = dateToDay(dataset.Time_Min, date);
      setTimeEnd(newEndDay);
      setTimeMaxValidity(true);
    } else {
      setTimeMaxValidity(false);
    }
  };

  // Check if dataset is monthly climatology
  const isMonthlyClimatology = useMemo(() => {
    return dataset?.Temporal_Resolution
      ? getIsMonthlyClimatology(dataset.Temporal_Resolution)
      : false;
  }, [dataset?.Temporal_Resolution]);

  // Determine if subset is defined (different from defaults)
  const subsetIsDefined = useMemo(() => {
    return (
      latStart !== lat.start ||
      latEnd !== lat.end ||
      lonStart !== lon.start ||
      lonEnd !== lon.end ||
      timeStart !== time.start ||
      timeEnd !== time.end ||
      depthStart !== depth.start ||
      depthEnd !== depth.end
    );
  }, [
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    timeStart,
    timeEnd,
    depthStart,
    depthEnd,
    lat.start,
    lat.end,
    lon.start,
    lon.end,
    time.start,
    time.end,
    depth.start,
    depth.end,
  ]);

  // Subset parameters object
  const subsetParams = useMemo(
    () => ({
      subsetIsDefined,
      temporalResolution: dataset?.Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      Time_Max: dataset?.Time_Max,
      Time_Min: dataset?.Time_Min,
      timeEnd,
      depthStart,
      depthEnd,
    }),
    [
      subsetIsDefined,
      dataset?.Temporal_Resolution,
      dataset?.Time_Max,
      dataset?.Time_Min,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      timeEnd,
      depthStart,
      depthEnd,
    ],
  );

  // Subset setters object
  const subsetSetters = useMemo(
    () => ({
      setTimeStart,
      setTimeEnd,
      setLatStart,
      setLatEnd,
      setLonStart,
      setLonEnd,
      setDepthStart,
      setDepthEnd,
    }),
    [],
  );

  // Options switch handler
  const handleSwitch = (event) => {
    setOptionsState((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setLatStart(lat.start);
    setLatEnd(lat.end);
    setLonStart(lon.start);
    setLonEnd(lon.end);
    setTimeStart(time.start);
    setTimeEnd(time.end);
    setDepthStart(depth.start);
    setDepthEnd(depth.end);
    setInvalidFlag(false);
    setValidTimeMin(true);
    setValidTimeMax(true);
  };

  // Set specific subset values
  const setSubsetValues = (values) => {
    if (values.latStart !== undefined) setLatStart(values.latStart);
    if (values.latEnd !== undefined) setLatEnd(values.latEnd);
    if (values.lonStart !== undefined) setLonStart(values.lonStart);
    if (values.lonEnd !== undefined) setLonEnd(values.lonEnd);
    if (values.timeStart !== undefined) setTimeStart(values.timeStart);
    if (values.timeEnd !== undefined) setTimeEnd(values.timeEnd);
    if (values.depthStart !== undefined) setDepthStart(values.depthStart);
    if (values.depthEnd !== undefined) setDepthEnd(values.depthEnd);
  };

  return {
    // State values
    subsetParams,
    subsetSetters,
    subsetIsDefined,
    maxDays,
    isInvalid,

    // Options state (if enabled)
    ...(includeOptionsState && {
      optionsState,
      handleSwitch,
      setOptionsState,
    }),

    // Utility functions
    setInvalidFlag,
    resetToDefaults,
    setSubsetValues,

    // Date-specific functionality
    dateIsWithinBounds,
    handleSetStartDate,
    handleSetEndDate,
    validTimeMin,
    validTimeMax,
    setTimeMinValidity,
    setTimeMaxValidity,
    isMonthlyClimatology,

    // Individual state values (for direct access if needed)
    values: {
      latStart,
      latEnd,
      lonStart,
      lonEnd,
      timeStart,
      timeEnd,
      depthStart,
      depthEnd,
    },

    // Default ranges
    defaults: {
      lat,
      lon,
      time,
      depth,
      maxDays,
    },
  };
};

export default useSubsetControls;
