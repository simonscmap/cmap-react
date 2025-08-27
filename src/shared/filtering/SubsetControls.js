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
  subsetParams,
  subsetSetters,
  datasetBounds,
  dateHandling,
}) => {
  // Transform into clean layout props
  const layoutProps = {
    // Organized control configs instead of scattered props
    controls: {
      date: {
        data: {
          timeStart: subsetParams.timeStart,
          timeEnd: subsetParams.timeEnd,
          maxDays: dateHandling.maxDays,
          isMonthlyClimatology: dateHandling.isMonthlyClimatology,
        },
        handlers: {
          setTimeStart: subsetSetters.setTimeStart,
          setTimeEnd: subsetSetters.setTimeEnd,
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
          latStart: subsetParams.latStart,
          latEnd: subsetParams.latEnd,
          latMin: datasetBounds.latMin,
          latMax: datasetBounds.latMax,
        },
        handlers: {
          setLatStart: subsetSetters.setLatStart,
          setLatEnd: subsetSetters.setLatEnd,
        },
      },
      longitude: {
        data: {
          lonStart: subsetParams.lonStart,
          lonEnd: subsetParams.lonEnd,
          lonMin: datasetBounds.lonMin,
          lonMax: datasetBounds.lonMax,
        },
        handlers: {
          setLonStart: subsetSetters.setLonStart,
          setLonEnd: subsetSetters.setLonEnd,
        },
      },
      depth: {
        data: {
          depthStart: subsetParams.depthStart,
          depthEnd: subsetParams.depthEnd,
          depthMin: datasetBounds.depthMin,
          depthMax: datasetBounds.depthMax,
        },
        handlers: {
          setDepthStart: subsetSetters.setDepthStart,
          setDepthEnd: subsetSetters.setDepthEnd,
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
