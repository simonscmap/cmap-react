import React from 'react';
import DefaultSubsetControlsLayout from './DefaultSubsetControlsLayout';

import logInit from '../../Services/log-service';
const log = logInit('dialog subset controls').addContext({
  src: 'shared/filtering/SubsetControls',
});

// This component serves as a coordinating container that:
// 1. Transforms raw hook data into organized, clean props for layouts
// 2. Simplifies consumer usage by requiring only essential props
// 3. Maintains clean separation between data management and presentation

const SubsetControls = ({
  optionsState,
  handleSwitch,
  setInvalidFlag,
  children,
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
    // Toggle state
    toggle: {
      optionsState,
      handleSwitch,
    },
  };

  return children ? (
    React.cloneElement(children, layoutProps)
  ) : (
    <DefaultSubsetControlsLayout {...layoutProps} />
  );
};

export default SubsetControls;
