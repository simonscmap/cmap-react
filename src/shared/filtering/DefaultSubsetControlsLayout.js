import React from 'react';
import { Collapse } from '@material-ui/core';

import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import ToggleWithHelp from '../components/ToggleWithHelp';

const DefaultSubsetControlsLayout = (props) => {
  // Check if we're receiving organized props (new pattern) or legacy scattered props
  const { controls, toggle, classes } = props;

  if (controls && toggle) {
    // New organized props pattern
    return (
      <React.Fragment>
        <ToggleWithHelp
          downloadOption={{
            handler: toggle.handleSwitch,
            switchState: toggle.optionsState.subset,
            name: 'subset',
            label: 'Define Subset',
          }}
          description="Define a subset of the data for download by specifying time, lat, lon, and depth parameters."
        />

        <Collapse in={toggle.optionsState.subset}>
          <div className={classes.subsetStep}>
            <DateSubsetControl
              dataset={controls.date.dataset}
              timeMin={controls.date.dataset?.Time_Min}
              timeMax={controls.date.dataset?.Time_Max}
              setTimeStart={controls.date.handlers.setTimeStart}
              setTimeEnd={controls.date.handlers.setTimeEnd}
              subsetState={{
                timeStart: controls.date.data.timeStart,
                timeEnd: controls.date.data.timeEnd,
                maxDays: controls.date.data.maxDays,
              }}
              setInvalidFlag={controls.date.setInvalidFlag}
              handleSetStartDate={controls.date.handlers.handleSetStartDate}
              handleSetEndDate={controls.date.handlers.handleSetEndDate}
              validTimeMin={controls.date.validation.validTimeMin}
              validTimeMax={controls.date.validation.validTimeMax}
              isMonthlyClimatology={controls.date.data.isMonthlyClimatology}
            />
            <LatitudeSubsetControl
              latMin={controls.latitude.data.latMin}
              latMax={controls.latitude.data.latMax}
              setLatStart={controls.latitude.handlers.setLatStart}
              setLatEnd={controls.latitude.handlers.setLatEnd}
              subsetState={{
                latStart: controls.latitude.data.latStart,
                latEnd: controls.latitude.data.latEnd,
              }}
            />
            <LongitudeSubsetControl
              lonMin={controls.longitude.data.lonMin}
              lonMax={controls.longitude.data.lonMax}
              setLonStart={controls.longitude.handlers.setLonStart}
              setLonEnd={controls.longitude.handlers.setLonEnd}
              subsetState={{
                lonStart: controls.longitude.data.lonStart,
                lonEnd: controls.longitude.data.lonEnd,
              }}
            />
            <DepthSubsetControl
              depthMin={controls.depth.data.depthMin}
              depthMax={controls.depth.data.depthMax}
              setDepthStart={controls.depth.handlers.setDepthStart}
              setDepthEnd={controls.depth.handlers.setDepthEnd}
              subsetState={{
                depthStart: controls.depth.data.depthStart,
                depthEnd: controls.depth.data.depthEnd,
              }}
            />
          </div>
        </Collapse>
      </React.Fragment>
    );
  }

  // Legacy props pattern (backward compatibility)
  const {
    subsetParams,
    subsetSetters,
    setInvalidFlag,
    dataset,
    latMin,
    latMax,
    lonMin,
    lonMax,
    depthMin,
    depthMax,
    timeMin,
    timeMax,
    handleSwitch,
    optionsState,
    maxDays,
    handleSetStartDate,
    handleSetEndDate,
    validTimeMin,
    validTimeMax,
    isMonthlyClimatology,
  } = props;

  const {
    timeStart,
    timeEnd,
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    depthStart,
    depthEnd,
  } = subsetParams;

  const {
    setTimeStart,
    setTimeEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
    setDepthStart,
    setDepthEnd,
  } = subsetSetters;

  return (
    <React.Fragment>
      <ToggleWithHelp
        downloadOption={{
          handler: handleSwitch,
          switchState: optionsState.subset,
          name: 'subset',
          label: 'Define Subset',
        }}
        description={
          'Define a subset of the data for download by specifying time, lat, lon, and depth parameters.'
        }
      />

      <Collapse in={optionsState.subset}>
        <div className={classes.subsetStep}>
          <DateSubsetControl
            dataset={dataset}
            timeMin={timeMin}
            timeMax={timeMax}
            setTimeStart={setTimeStart}
            setTimeEnd={setTimeEnd}
            subsetState={{ timeStart, timeEnd, maxDays }}
            setInvalidFlag={setInvalidFlag}
            handleSetStartDate={handleSetStartDate}
            handleSetEndDate={handleSetEndDate}
            validTimeMin={validTimeMin}
            validTimeMax={validTimeMax}
            isMonthlyClimatology={isMonthlyClimatology}
          />

          <LatitudeSubsetControl
            latMin={latMin}
            latMax={latMax}
            setLatStart={setLatStart}
            setLatEnd={setLatEnd}
            subsetState={{ latStart, latEnd }}
          />

          <LongitudeSubsetControl
            lonMin={lonMin}
            lonMax={lonMax}
            setLonStart={setLonStart}
            setLonEnd={setLonEnd}
            subsetState={{ lonStart, lonEnd }}
          />

          <DepthSubsetControl
            depthMin={depthMin}
            depthMax={depthMax}
            setDepthStart={setDepthStart}
            setDepthEnd={setDepthEnd}
            subsetState={{ depthStart, depthEnd }}
          />
        </div>
      </Collapse>
    </React.Fragment>
  );
};

export default DefaultSubsetControlsLayout;
