import React from 'react';
import DefaultSubsetControlsLayout from './DefaultSubsetControlsLayout';
import useSubsetFiltering from './useSubsetFiltering';

import logInit from '../../Services/log-service';
const log = logInit('dialog subset controls').addContext({
  src: 'shared/filtering/SubsetControls',
});

// This component serves as a coordinating container that:
// 1. Manages subset filtering logic via useSubsetFiltering hook
// 2. Transforms raw hook data into organized, clean props for layouts
// 3. Simplifies consumer usage by requiring only essential props
// 4. Maintains clean separation between data management and presentation

const SubsetControls = ({
  dataset,
  optionsState,
  handleSwitch,
  setInvalidFlag,
  classes,
  children,
  // Legacy props for backward compatibility during transition
  ...legacyProps
}) => {
  // Get all raw hook data (must be called unconditionally)
  const hookData = useSubsetFiltering(dataset);

  // If legacy props are provided, use the old behavior temporarily
  if (Object.keys(legacyProps).length > 0) {
    log.warn(
      'Using legacy prop-forwarding behavior. Please update to use the new coordinating container pattern.',
    );
    return children ? (
      React.cloneElement(children, legacyProps)
    ) : (
      <DefaultSubsetControlsLayout {...legacyProps} />
    );
  }

  // Transform into clean layout props
  const layoutProps = {
    // Organized control configs instead of scattered props
    controls: {
      date: {
        data: {
          timeStart: hookData.subsetParams.timeStart,
          timeEnd: hookData.subsetParams.timeEnd,
          maxDays: hookData.maxDays,
          isMonthlyClimatology: hookData.isMonthlyClimatology,
        },
        handlers: {
          setTimeStart: hookData.subsetSetters.setTimeStart,
          setTimeEnd: hookData.subsetSetters.setTimeEnd,
          handleSetStartDate: hookData.handleSetStartDate,
          handleSetEndDate: hookData.handleSetEndDate,
        },
        validation: {
          validTimeMin: hookData.validTimeMin,
          validTimeMax: hookData.validTimeMax,
        },
        setInvalidFlag,
        dataset,
      },
      latitude: {
        data: {
          latStart: hookData.subsetParams.latStart,
          latEnd: hookData.subsetParams.latEnd,
          latMin: hookData.latMin,
          latMax: hookData.latMax,
        },
        handlers: {
          setLatStart: hookData.subsetSetters.setLatStart,
          setLatEnd: hookData.subsetSetters.setLatEnd,
        },
        dataset,
      },
      longitude: {
        data: {
          lonStart: hookData.subsetParams.lonStart,
          lonEnd: hookData.subsetParams.lonEnd,
          lonMin: hookData.lonMin,
          lonMax: hookData.lonMax,
        },
        handlers: {
          setLonStart: hookData.subsetSetters.setLonStart,
          setLonEnd: hookData.subsetSetters.setLonEnd,
        },
        dataset,
      },
      depth: {
        data: {
          depthStart: hookData.subsetParams.depthStart,
          depthEnd: hookData.subsetParams.depthEnd,
          depthMin: hookData.depthMin,
          depthMax: hookData.depthMax,
        },
        handlers: {
          setDepthStart: hookData.subsetSetters.setDepthStart,
          setDepthEnd: hookData.subsetSetters.setDepthEnd,
        },
        dataset,
      },
    },
    // Toggle state
    toggle: {
      optionsState,
      handleSwitch,
    },
    classes,
  };

  return children ? (
    React.cloneElement(children, layoutProps)
  ) : (
    <DefaultSubsetControlsLayout {...layoutProps} />
  );
};

export default SubsetControls;
