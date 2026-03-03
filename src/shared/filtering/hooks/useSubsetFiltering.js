import { useState, useMemo, useEffect } from 'react';
import {
  dateToUTCDateString,
  extractDateFromString,
  getIsMonthlyClimatology,
  getInitialRangeValues,
  parseUTCDateString,
} from '../utils/dateHelpers';
import { floorToStep, ceilToStep } from '../utils/rangeValidation';

const SLIDER_STEP = 0.1;

const initializeSliderEndpoints = (dataset) => {
  if (!dataset) {
    return {
      latMin: null,
      latMax: null,
      lonMin: null,
      lonMax: null,
      depthMin: null,
      depthMax: null,
      timeMin: null,
      timeMax: null,
    };
  }
  return {
    latMin: dataset.Lat_Min != null ? floorToStep(dataset.Lat_Min, SLIDER_STEP) : null,
    latMax: dataset.Lat_Max != null ? ceilToStep(dataset.Lat_Max, SLIDER_STEP) : null,
    lonMin: dataset.Lon_Min != null ? floorToStep(dataset.Lon_Min, SLIDER_STEP) : null,
    lonMax: dataset.Lon_Max != null ? ceilToStep(dataset.Lon_Max, SLIDER_STEP) : null,
    depthMin: dataset.Depth_Min != null ? floorToStep(dataset.Depth_Min, SLIDER_STEP) : null,
    depthMax: dataset.Depth_Max != null ? ceilToStep(dataset.Depth_Max, SLIDER_STEP) : null,
    timeMin: dataset.Time_Min ? parseUTCDateString(dataset.Time_Min) : null,
    timeMax: dataset.Time_Max ? parseUTCDateString(dataset.Time_Max) : null,
  };
};

/**
 * Pure filtering hook for managing subset filter parameters
 * @param {Object} dataset - Dataset object containing spatial and temporal bounds
 * @param {number} dataset.Lat_Min - Minimum latitude boundary
 * @param {number} dataset.Lat_Max - Maximum latitude boundary
 * @param {number} dataset.Lon_Min - Minimum longitude boundary
 * @param {number} dataset.Lon_Max - Maximum longitude boundary
 * @param {number} dataset.Depth_Min - Minimum depth boundary
 * @param {number} dataset.Depth_Max - Maximum depth boundary
 * @param {string} dataset.Time_Min - Minimum time boundary (ISO date string)
 * @param {string} dataset.Time_Max - Maximum time boundary (ISO date string)
 * @param {string} dataset.Temporal_Resolution - Temporal resolution (e.g., "monthly", "daily")
 */
const useSubsetFiltering = (dataset) => {
  // Get initial range values from dataset
  const { lat, lon, time, depth } = useMemo(() => {
    return dataset
      ? getInitialRangeValues(dataset)
      : {
          lat: { start: 0, end: 0 },
          lon: { start: 0, end: 0 },
          time: { start: 0, end: 0 },
          depth: { start: 0, end: 0 },
        };
  }, [dataset]);

  // State for filter parameters
  const [latStart, setLatStart] = useState(lat.start);
  const [latEnd, setLatEnd] = useState(lat.end);
  const [lonStart, setLonStart] = useState(lon.start);
  const [lonEnd, setLonEnd] = useState(lon.end);
  const [timeStart, setTimeStart] = useState(time.start);
  const [timeEnd, setTimeEnd] = useState(time.end);
  const [depthStart, setDepthStart] = useState(depth.start);
  const [depthEnd, setDepthEnd] = useState(depth.end);

  const [sliderEndpoints, setSliderEndpoints] = useState(() =>
    initializeSliderEndpoints(dataset),
  );

  // Fix for React state initialization race condition:
  // ISSUE: useState(lat.start) captures initial values, but when isFiltered useMemo runs,
  // it compares state values against potentially updated lat.start values from a later render.
  // This caused isFiltered=true during initialization when it should be false, leading to
  // incorrect row count API calls with "≤" values instead of exact counts.
  //
  // SOLUTION: Explicitly sync all filter state values with dataset bounds whenever bounds change.
  // This ensures state values always match current dataset bounds during initialization,
  // preventing the timing mismatch that caused the race condition.
  //
  // TRADEOFF: This will reset user-applied filters if the dataset reference changes,
  // but this is acceptable for the multi-dataset download use case where datasets
  // are loaded once per component lifecycle.
  useEffect(() => {
    setLatStart(lat.start);
    setLatEnd(lat.end);
    setLonStart(lon.start);
    setLonEnd(lon.end);
    setTimeStart(time.start);
    setTimeEnd(time.end);
    setDepthStart(depth.start);
    setDepthEnd(depth.end);
    setSliderEndpoints(initializeSliderEndpoints(dataset));
  }, [
    dataset,
    lat.start,
    lat.end,
    lon.start,
    lon.end,
    time.start,
    time.end,
    depth.start,
    depth.end,
  ]);

  const [isInvalid, setInvalidFlag] = useState(false);

  // Date validation state
  const [validTimeMin, setValidTimeMin] = useState(true);
  const [validTimeMax, setValidTimeMax] = useState(true);

  // Date validation functions
  const dateIsWithinBounds = useMemo(() => {
    if (!dataset?.Time_Min || !dataset?.Time_Max) return () => true;

    return (date) => {
      const tmin = dateToUTCDateString(dataset.Time_Min);
      const tmax = dateToUTCDateString(dataset.Time_Max);
      const d = dateToUTCDateString(date);
      return d >= tmin && d <= tmax;
    };
  }, [dataset?.Time_Min, dataset?.Time_Max]);

  // Date handlers for text inputs
  const handleSetStartDate = (value) => {
    if (!value) {
      setValidTimeMin(false);
      if (validTimeMax) {
        setInvalidFlag(true);
      }
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date);

    if (shouldUpdate) {
      setTimeStart(date);
      setValidTimeMin(true);
      if (validTimeMax) {
        setInvalidFlag(false);
      }
    } else {
      setValidTimeMin(false);
      if (validTimeMax) {
        setInvalidFlag(true);
      }
    }
  };

  const handleSetEndDate = (value) => {
    if (!value) {
      setValidTimeMax(false);
      if (validTimeMin) {
        setInvalidFlag(true);
      }
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date);

    if (shouldUpdate) {
      setTimeEnd(date);
      setValidTimeMax(true);
      if (validTimeMin) {
        setInvalidFlag(false);
      }
    } else {
      setValidTimeMax(false);
      if (validTimeMin) {
        setInvalidFlag(true);
      }
    }
  };

  // Check if dataset is monthly climatology
  const isMonthlyClimatology = useMemo(() => {
    return dataset?.Temporal_Resolution
      ? getIsMonthlyClimatology(dataset.Temporal_Resolution)
      : false;
  }, [dataset?.Temporal_Resolution]);

  // Determine if filter is defined (different from defaults)
  const isFiltered = useMemo(() => {
    return (
      latStart !== lat.start ||
      latEnd !== lat.end ||
      lonStart !== lon.start ||
      lonEnd !== lon.end ||
      dateToUTCDateString(timeStart) > dateToUTCDateString(time.start) ||
      dateToUTCDateString(timeEnd) < dateToUTCDateString(time.end) ||
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

  // Filter parameters object
  const filterValues = useMemo(
    () => ({
      isFiltered,
      temporalResolution: dataset?.Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      timeEnd,
      depthStart,
      depthEnd,
      Time_Min: dataset?.Time_Min,
      Time_Max: dataset?.Time_Max,
    }),
    [
      isFiltered,
      dataset?.Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      timeEnd,
      depthStart,
      depthEnd,
      dataset?.Time_Min,
      dataset?.Time_Max,
    ],
  );

  // Filter setters object
  const filterSetters = useMemo(
    () => ({
      setTimeStart,
      setTimeEnd,
      setLatStart,
      setLatEnd,
      setLonStart,
      setLonEnd,
      setDepthStart,
      setDepthEnd,
      setSliderEndpoints,
    }),
    [],
  );

  return {
    // Core data objects
    filterValues,
    filterSetters,
    sliderEndpoints,
    datasetFilterBounds: {
      latMin: dataset?.Lat_Min != null ? floorToStep(dataset.Lat_Min, SLIDER_STEP) : null,
      latMax: dataset?.Lat_Max != null ? ceilToStep(dataset.Lat_Max, SLIDER_STEP) : null,
      lonMin: dataset?.Lon_Min != null ? floorToStep(dataset.Lon_Min, SLIDER_STEP) : null,
      lonMax: dataset?.Lon_Max != null ? ceilToStep(dataset.Lon_Max, SLIDER_STEP) : null,
      depthMin: dataset?.Depth_Min != null ? floorToStep(dataset.Depth_Min, SLIDER_STEP) : null,
      depthMax: dataset?.Depth_Max != null ? ceilToStep(dataset.Depth_Max, SLIDER_STEP) : null,
      timeMin: dataset?.Time_Min ? parseUTCDateString(dataset.Time_Min) : null,
      timeMax: dataset?.Time_Max ? parseUTCDateString(dataset.Time_Max) : null,
    },

    dateHandling: {
      isMonthlyClimatology,
      handleSetStartDate,
      handleSetEndDate,
      validTimeMin,
      validTimeMax,
    },

    // Individual state values
    isFiltered,
    isInvalid,
    setInvalidFlag,
  };
};

export default useSubsetFiltering;
