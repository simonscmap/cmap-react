import React from 'react';

import logInit from '../../Services/log-service';
const log = logInit('dialog subset controls').addContext({
  src: 'shared/filtering/SubsetControls',
});

// This component serves as a coordinating container that:
// 1. Transforms raw hook data into organized, clean props for layouts
// 2. Simplifies consumer usage by requiring only essential props
// 3. Maintains clean separation between data management and presentation

/**
 * Headless subset controls component for filtering data by time, latitude, longitude, and depth
 * Provides filtering data to layout components without managing any UI state
 * @param {Function} setInvalidFlag - Sets validation error flags
 * @param {React.ReactNode} children - Required layout component (no default layout)
 * @param {Object} filterValues - Current filter values { timeStart, timeEnd, latStart, latEnd, lonStart, lonEnd, depthStart, depthEnd }
 * @param {Object} filterSetters - Setter functions { setTimeStart, setTimeEnd, setLatStart, setLatEnd, setLonStart, setLonEnd, setDepthStart, setDepthEnd }
 * @param {Object} datasetFilterBounds - Min/max bounds { timeMin, timeMax, latMin, latMax, lonMin, lonMax, depthMin, depthMax, maxDays }
 * @param {Object} dateHandling - Date-specific handlers and validation { isMonthlyClimatology, handleSetStartDate, handleSetEndDate, validTimeMin, validTimeMax }
 */
const SubsetControls = ({
  setInvalidFlag,
  children, // Required - no default layout
  filterValues,
  filterSetters,
  datasetFilterBounds,
  dateHandling,
}) => {
  // Transform into clean layout props
  const layoutProps = {
    // Organized control configs instead of scattered props
    controls: {
      date: {
        data: {
          timeStart: filterValues.timeStart,
          timeEnd: filterValues.timeEnd,
          maxDays: datasetFilterBounds.maxDays,
          isMonthlyClimatology: dateHandling.isMonthlyClimatology,
          timeMin: datasetFilterBounds.timeMin,
          timeMax: datasetFilterBounds.timeMax,
        },
        handlers: {
          setTimeStart: filterSetters.setTimeStart,
          setTimeEnd: filterSetters.setTimeEnd,
          handleSetStartDate: dateHandling.handleSetStartDate,
          handleSetEndDate: dateHandling.handleSetEndDate,
        },
        validation: {
          validTimeMin: dateHandling.validTimeMin,
          validTimeMax: dateHandling.validTimeMax,
        },
        setInvalidFlag,
      },
      latitude: {
        data: {
          latStart: filterValues.latStart,
          latEnd: filterValues.latEnd,
          latMin: datasetFilterBounds.latMin,
          latMax: datasetFilterBounds.latMax,
        },
        handlers: {
          setLatStart: filterSetters.setLatStart,
          setLatEnd: filterSetters.setLatEnd,
        },
      },
      longitude: {
        data: {
          lonStart: filterValues.lonStart,
          lonEnd: filterValues.lonEnd,
          lonMin: datasetFilterBounds.lonMin,
          lonMax: datasetFilterBounds.lonMax,
        },
        handlers: {
          setLonStart: filterSetters.setLonStart,
          setLonEnd: filterSetters.setLonEnd,
        },
      },
      depth: {
        data: {
          depthStart: filterValues.depthStart,
          depthEnd: filterValues.depthEnd,
          depthMin: datasetFilterBounds.depthMin,
          depthMax: datasetFilterBounds.depthMax,
        },
        handlers: {
          setDepthStart: filterSetters.setDepthStart,
          setDepthEnd: filterSetters.setDepthEnd,
        },
      },
    },
  };

  return React.cloneElement(children, layoutProps);
};

export default SubsetControls;
