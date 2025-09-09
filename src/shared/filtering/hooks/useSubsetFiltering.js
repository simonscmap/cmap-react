import { useMemo } from 'react';
import { create } from 'zustand';
import {
  dateToDateString,
  dateToDay,
  extractDateFromString,
  getIsMonthlyClimatology,
  getInitialRangeValues,
} from '../utils/dateHelpers';

// Helper function for date validation
const dateIsWithinBounds = (date, dataset) => {
  if (!dataset?.Time_Min || !dataset?.Time_Max) return true;
  const tmin = dateToDateString(dataset.Time_Min);
  const tmax = dateToDateString(dataset.Time_Max);
  const d = dateToDateString(date);
  return d >= tmin && d <= tmax;
};

// Zustand store for subset filtering state
const useSubsetFilterStore = create((set, get) => ({
  // Filter values
  latStart: 0,
  latEnd: 0,
  lonStart: 0,
  lonEnd: 0,
  timeStart: 0,
  timeEnd: 0,
  depthStart: 0,
  depthEnd: 0,

  // Validation state
  isInvalid: false,
  validTimeMin: true,
  validTimeMax: true,

  // Dataset bounds for validation
  dataset: null,
  initialRanges: null,

  // Actions
  setLatStart: (value) => set({ latStart: value }),
  setLatEnd: (value) => set({ latEnd: value }),
  setLonStart: (value) => set({ lonStart: value }),
  setLonEnd: (value) => set({ lonEnd: value }),
  setTimeStart: (value) => set({ timeStart: value }),
  setTimeEnd: (value) => set({ timeEnd: value }),
  setDepthStart: (value) => set({ depthStart: value }),
  setDepthEnd: (value) => set({ depthEnd: value }),

  setInvalidFlag: (value) => set({ isInvalid: value }),
  setValidTimeMin: (value) => set({ validTimeMin: value }),
  setValidTimeMax: (value) => set({ validTimeMax: value }),

  // Initialize with dataset
  initializeWithDataset: (dataset) => {
    const initialRanges = dataset
      ? getInitialRangeValues(dataset)
      : {
          maxDays: 0,
          lat: { start: 0, end: 0 },
          lon: { start: 0, end: 0 },
          time: { start: 0, end: 0 },
          depth: { start: 0, end: 0 },
        };

    set({
      dataset,
      initialRanges,
      latStart: initialRanges.lat.start,
      latEnd: initialRanges.lat.end,
      lonStart: initialRanges.lon.start,
      lonEnd: initialRanges.lon.end,
      timeStart: initialRanges.time.start,
      timeEnd: initialRanges.time.end,
      depthStart: initialRanges.depth.start,
      depthEnd: initialRanges.depth.end,
      isInvalid: false,
      validTimeMin: true,
      validTimeMax: true,
    });
  },

  // Date handlers
  handleSetStartDate: (value) => {
    const state = get();
    const { dataset, validTimeMax } = state;

    if (!value) {
      set({ validTimeMin: false });
      if (validTimeMax) {
        set({ isInvalid: true });
      }
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date, dataset);

    if (shouldUpdate && dataset?.Time_Min) {
      const newStartDay = dateToDay(dataset.Time_Min, date);
      set({
        timeStart: newStartDay,
        validTimeMin: true,
      });
      if (validTimeMax) {
        set({ isInvalid: false });
      }
    } else {
      set({ validTimeMin: false });
      if (validTimeMax) {
        set({ isInvalid: true });
      }
    }
  },

  handleSetEndDate: (value) => {
    const state = get();
    const { dataset, validTimeMin } = state;

    if (!value) {
      set({ validTimeMax: false });
      if (validTimeMin) {
        set({ isInvalid: true });
      }
      return;
    }

    const date = extractDateFromString(value);
    const shouldUpdate = dateIsWithinBounds(date, dataset);

    if (shouldUpdate && dataset?.Time_Min) {
      const newEndDay = dateToDay(dataset.Time_Min, date);
      set({
        timeEnd: newEndDay,
        validTimeMax: true,
      });
      if (validTimeMin) {
        set({ isInvalid: false });
      }
    } else {
      set({ validTimeMax: false });
      if (validTimeMin) {
        set({ isInvalid: true });
      }
    }
  },

  // Reset store to initial state
  resetStore: () => {
    set({
      latStart: 0,
      latEnd: 0,
      lonStart: 0,
      lonEnd: 0,
      timeStart: 0,
      timeEnd: 0,
      depthStart: 0,
      depthEnd: 0,
      isInvalid: false,
      validTimeMin: true,
      validTimeMax: true,
      dataset: null,
      initialRanges: null,
    });
  },
}));

/**
 * Pure filtering hook for managing subset filter parameters (Zustand version)
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
  // Get state and actions from Zustand store
  const {
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    timeStart,
    timeEnd,
    depthStart,
    depthEnd,
    isInvalid,
    validTimeMin,
    validTimeMax,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
    setTimeStart,
    setTimeEnd,
    setDepthStart,
    setDepthEnd,
    setInvalidFlag,
    initializeWithDataset,
    handleSetStartDate,
    handleSetEndDate,
    resetStore,
  } = useSubsetFilterStore();

  // Initialize store when dataset changes
  useMemo(() => {
    initializeWithDataset(dataset);
  }, [dataset]);

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
    }),
    [
      setTimeStart,
      setTimeEnd,
      setLatStart,
      setLatEnd,
      setLonStart,
      setLonEnd,
      setDepthStart,
      setDepthEnd,
    ],
  );

  return {
    // Core data objects
    filterValues,
    filterSetters,

    // Logical groupings for SubsetControls
    datasetFilterBounds: {
      latMin: dataset?.Lat_Min,
      latMax: dataset?.Lat_Max,
      lonMin: dataset?.Lon_Min,
      lonMax: dataset?.Lon_Max,
      depthMin: dataset?.Depth_Min,
      depthMax: dataset?.Depth_Max,
      timeMin: dataset?.Time_Min,
      timeMax: dataset?.Time_Max,
      maxDays,
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

    // Store management
    resetStore,
  };
};

export default useSubsetFiltering;
