import { useState, useMemo } from 'react';
import {
  dateToDateString,
  dateToDay,
  extractDateFromString,
  getIsMonthlyClimatology,
  getInitialRangeValues,
} from './dateHelpers';

/**
 * Pure filtering hook for managing subset parameters
 * Contains all pure filtering logic without UI-specific state
 *
 * @param {Object} dataset - Dataset object containing metadata
 * @returns {Object} Pure filtering state and handlers
 */
const useSubsetFiltering = (dataset) => {
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

    if (shouldUpdate && dataset?.Time_Min) {
      const newStartDay = dateToDay(dataset.Time_Min, date);
      setTimeStart(newStartDay);
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

    if (shouldUpdate && dataset?.Time_Min) {
      const newEndDay = dateToDay(dataset.Time_Min, date);
      setTimeEnd(newEndDay);
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

  return {
    // Core data objects
    subsetParams,
    subsetSetters,

    // Logical groupings for SubsetControls
    datasetBounds: {
      latMin: dataset?.Lat_Min,
      latMax: dataset?.Lat_Max,
      lonMin: dataset?.Lon_Min,
      lonMax: dataset?.Lon_Max,
      depthMin: dataset?.Depth_Min,
      depthMax: dataset?.Depth_Max,
      timeMin: dataset?.Time_Min,
      timeMax: dataset?.Time_Max,
    },

    dateHandling: {
      maxDays,
      isMonthlyClimatology,
      handleSetStartDate,
      handleSetEndDate,
      validTimeMin,
      validTimeMax,
    },

    // Individual state values
    subsetIsDefined,
    isInvalid,
    setInvalidFlag,
  };
};

export default useSubsetFiltering;
