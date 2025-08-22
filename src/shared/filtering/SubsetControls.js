import React, { useState, useRef } from 'react';
import { Collapse } from '@material-ui/core';

import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import DownloadOption from '../DownloadDialog/DownloadOption';

import logInit from '../../../../Services/log-service';
const log = logInit('dialog subset controls').addContext({
  src: 'features/datasetDownload/components/SubsetControls',
});

// This component gathers the four sets of control fields and passes
// state and setters down into those control components;
// There is no local state

let SubsetControls = (props) => {
  let {
    subsetParams,
    subsetSetters,
    setInvalidFlag,
    dataset,
    handleSwitch,
    optionsState,
    maxDays,
    classes,
  } = props;

  let {
    timeStart,
    timeEnd,
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    depthStart,
    depthEnd,
  } = subsetParams;

  let {
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
      <DownloadOption
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

export default SubsetControls;
