import React from 'react';
import { Collapse } from '@material-ui/core';

import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import ToggleWithHelp from '../components/ToggleWithHelp';
import styles from './styles/DefaultSubsetControlsLayoutStyles';

const DefaultSubsetControlsLayout = ({ controls, toggle }) => {
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
        <div style={styles.subsetStep}>
          <DateSubsetControl
            timeMin={controls.date.data.timeMin}
            timeMax={controls.date.data.timeMax}
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
};

export default DefaultSubsetControlsLayout;
