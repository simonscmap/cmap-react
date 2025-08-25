import React from 'react';
import { Collapse } from '@material-ui/core';

import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import ToggleWithHelp from '../components/ToggleWithHelp';

const DefaultSubsetControlsLayout = (props) => {
  const {
    subsetParams,
    subsetSetters,
    setInvalidFlag,
    dataset,
    handleSwitch,
    optionsState,
    maxDays,
    classes,
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
            dataset={dataset}
            setLatStart={setLatStart}
            setLatEnd={setLatEnd}
            subsetState={{ latStart, latEnd }}
          />

          <LongitudeSubsetControl
            dataset={dataset}
            setLonStart={setLonStart}
            setLonEnd={setLonEnd}
            subsetState={{ lonStart, lonEnd }}
          />

          <DepthSubsetControl
            dataset={dataset}
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
