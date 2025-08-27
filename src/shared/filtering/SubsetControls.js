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
  subsetFiltering,
}) => {
  // Transform into clean layout props
  const layoutProps = {
    // Organized control configs instead of scattered props
    controls: {
      date: {
        data: {
          timeStart: subsetFiltering.subsetParams.timeStart,
          timeEnd: subsetFiltering.subsetParams.timeEnd,
          maxDays: subsetFiltering.maxDays,
          isMonthlyClimatology: subsetFiltering.isMonthlyClimatology,
        },
        handlers: {
          setTimeStart: subsetFiltering.subsetSetters.setTimeStart,
          setTimeEnd: subsetFiltering.subsetSetters.setTimeEnd,
          handleSetStartDate: subsetFiltering.handleSetStartDate,
          handleSetEndDate: subsetFiltering.handleSetEndDate,
        },
        validation: {
          validTimeMin: subsetFiltering.validTimeMin,
          validTimeMax: subsetFiltering.validTimeMax,
        },
        setInvalidFlag,
      },
      latitude: {
        data: {
          latStart: subsetFiltering.subsetParams.latStart,
          latEnd: subsetFiltering.subsetParams.latEnd,
          latMin: subsetFiltering.latMin,
          latMax: subsetFiltering.latMax,
        },
        handlers: {
          setLatStart: subsetFiltering.subsetSetters.setLatStart,
          setLatEnd: subsetFiltering.subsetSetters.setLatEnd,
        },
      },
      longitude: {
        data: {
          lonStart: subsetFiltering.subsetParams.lonStart,
          lonEnd: subsetFiltering.subsetParams.lonEnd,
          lonMin: subsetFiltering.lonMin,
          lonMax: subsetFiltering.lonMax,
        },
        handlers: {
          setLonStart: subsetFiltering.subsetSetters.setLonStart,
          setLonEnd: subsetFiltering.subsetSetters.setLonEnd,
        },
      },
      depth: {
        data: {
          depthStart: subsetFiltering.subsetParams.depthStart,
          depthEnd: subsetFiltering.subsetParams.depthEnd,
          depthMin: subsetFiltering.depthMin,
          depthMax: subsetFiltering.depthMax,
        },
        handlers: {
          setDepthStart: subsetFiltering.subsetSetters.setDepthStart,
          setDepthEnd: subsetFiltering.subsetSetters.setDepthEnd,
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
