import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  dateToDateString,
  dateToDay,
  extractDateFromString,
  getIsMonthlyClimatology,
  getInitialRangeValues,
} from '../utils/dateHelpers';

const createSubsetFilteringStore = () =>
  create(
    subscribeWithSelector((set, get) => ({
      // Core state
      dataset: null,
      initialValues: null,

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

      // Actions
      initializeFromDataset: (dataset) => {
        const initialValues = dataset
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
          initialValues,
          latStart: initialValues.lat.start,
          latEnd: initialValues.lat.end,
          lonStart: initialValues.lon.start,
          lonEnd: initialValues.lon.end,
          timeStart: initialValues.time.start,
          timeEnd: initialValues.time.end,
          depthStart: initialValues.depth.start,
          depthEnd: initialValues.depth.end,
          isInvalid: false,
          validTimeMin: true,
          validTimeMax: true,
        });
      },

      setLatStart: (value) => set({ latStart: value }),
      setLatEnd: (value) => set({ latEnd: value }),
      setLonStart: (value) => set({ lonStart: value }),
      setLonEnd: (value) => set({ lonEnd: value }),
      setTimeStart: (value) => set({ timeStart: value }),
      setTimeEnd: (value) => set({ timeEnd: value }),
      setDepthStart: (value) => set({ depthStart: value }),
      setDepthEnd: (value) => set({ depthEnd: value }),
      setInvalidFlag: (value) => set({ isInvalid: value }),

      resetStore: () => {
        set({
          dataset: null,
          initialValues: null,
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
        });
      },

      handleSetStartDate: (value) => {
        const state = get();
        const { dataset, validTimeMax } = state;

        if (!value) {
          set({
            validTimeMin: false,
            isInvalid: validTimeMax ? true : state.isInvalid,
          });
          return;
        }

        const date = extractDateFromString(value);
        const dateIsWithinBounds = state.getDateIsWithinBounds();
        const shouldUpdate = dateIsWithinBounds(date);

        if (shouldUpdate && dataset && dataset.Time_Min) {
          const newStartDay = dateToDay(dataset.Time_Min, date);
          set({
            timeStart: newStartDay,
            validTimeMin: true,
            isInvalid: validTimeMax ? false : state.isInvalid,
          });
        } else {
          set({
            validTimeMin: false,
            isInvalid: validTimeMax ? true : state.isInvalid,
          });
        }
      },

      handleSetEndDate: (value) => {
        const state = get();
        const { dataset, validTimeMin } = state;

        if (!value) {
          set({
            validTimeMax: false,
            isInvalid: validTimeMin ? true : state.isInvalid,
          });
          return;
        }

        const date = extractDateFromString(value);
        const dateIsWithinBounds = state.getDateIsWithinBounds();
        const shouldUpdate = dateIsWithinBounds(date);

        if (shouldUpdate && dataset && dataset.Time_Min) {
          const newEndDay = dateToDay(dataset.Time_Min, date);
          set({
            timeEnd: newEndDay,
            validTimeMax: true,
            isInvalid: validTimeMin ? false : state.isInvalid,
          });
        } else {
          set({
            validTimeMax: false,
            isInvalid: validTimeMin ? true : state.isInvalid,
          });
        }
      },

      // Computed values as methods
      getDateIsWithinBounds: () => {
        const { dataset } = get();
        if (!dataset || !dataset.Time_Min || !dataset.Time_Max)
          return () => true;

        return (date) => {
          const tmin = dateToDateString(dataset.Time_Min);
          const tmax = dateToDateString(dataset.Time_Max);
          const d = dateToDateString(date);
          return d >= tmin && d <= tmax;
        };
      },

      getIsMonthlyClimatology: () => {
        const { dataset } = get();
        return dataset && dataset.Temporal_Resolution
          ? getIsMonthlyClimatology(dataset.Temporal_Resolution)
          : false;
      },

      getIsFiltered: () => {
        const state = get();
        const { initialValues } = state;
        if (!initialValues) return false;

        return (
          state.latStart !== initialValues.lat.start ||
          state.latEnd !== initialValues.lat.end ||
          state.lonStart !== initialValues.lon.start ||
          state.lonEnd !== initialValues.lon.end ||
          state.timeStart !== initialValues.time.start ||
          state.timeEnd !== initialValues.time.end ||
          state.depthStart !== initialValues.depth.start ||
          state.depthEnd !== initialValues.depth.end
        );
      },

      getFilterValues: () => {
        const state = get();
        const { dataset } = state;
        const isFiltered = state.getIsFiltered();

        return {
          isFiltered,
          temporalResolution: dataset && dataset.Temporal_Resolution,
          lonStart: state.lonStart,
          lonEnd: state.lonEnd,
          latStart: state.latStart,
          latEnd: state.latEnd,
          timeStart: state.timeStart,
          timeEnd: state.timeEnd,
          depthStart: state.depthStart,
          depthEnd: state.depthEnd,
          Time_Min: dataset && dataset.Time_Min,
        };
      },

      getFilterSetters: () => {
        const state = get();
        return {
          setTimeStart: state.setTimeStart,
          setTimeEnd: state.setTimeEnd,
          setLatStart: state.setLatStart,
          setLatEnd: state.setLatEnd,
          setLonStart: state.setLonStart,
          setLonEnd: state.setLonEnd,
          setDepthStart: state.setDepthStart,
          setDepthEnd: state.setDepthEnd,
        };
      },

      getDatasetFilterBounds: () => {
        const state = get();
        const { dataset, initialValues } = state;

        return {
          latMin: dataset && dataset.Lat_Min,
          latMax: dataset && dataset.Lat_Max,
          lonMin: dataset && dataset.Lon_Min,
          lonMax: dataset && dataset.Lon_Max,
          depthMin: dataset && dataset.Depth_Min,
          depthMax: dataset && dataset.Depth_Max,
          timeMin: dataset && dataset.Time_Min,
          timeMax: dataset && dataset.Time_Max,
          maxDays: initialValues ? initialValues.maxDays : 0,
        };
      },

      getDateHandling: () => {
        const state = get();
        return {
          isMonthlyClimatology: state.getIsMonthlyClimatology(),
          handleSetStartDate: state.handleSetStartDate,
          handleSetEndDate: state.handleSetEndDate,
          validTimeMin: state.validTimeMin,
          validTimeMax: state.validTimeMax,
        };
      },
    })),
  );

// Store instances keyed by dataset reference
const storeInstances = new WeakMap();

const useSubsetFiltering = (dataset) => {
  // Get or create store instance for this dataset
  let store = storeInstances.get(dataset);
  if (!store) {
    store = createSubsetFilteringStore();
    if (dataset) {
      storeInstances.set(dataset, store);
    }
  }

  // Initialize store with dataset if it's different
  const currentDataset = store.getState().dataset;
  if (currentDataset !== dataset) {
    store.getState().initializeFromDataset(dataset);
  }

  // Subscribe to store state
  const state = store();

  // Return the same interface as the original hook
  return {
    // Core data objects
    filterValues: state.getFilterValues(),
    filterSetters: state.getFilterSetters(),

    // Logical groupings for SubsetControls
    datasetFilterBounds: state.getDatasetFilterBounds(),
    dateHandling: state.getDateHandling(),

    // Individual state values
    isFiltered: state.getIsFiltered(),
    isInvalid: state.isInvalid,
    setInvalidFlag: state.setInvalidFlag,

    // Reset functionality
    resetStore: state.resetStore,
  };
};

export default useSubsetFiltering;
