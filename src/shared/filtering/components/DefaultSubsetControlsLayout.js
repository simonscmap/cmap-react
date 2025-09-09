import React from 'react';
import { Collapse } from '@material-ui/core';

import MonthlyDateSubsetControl from './controls/MonthlyDateSubsetControl';
import DailyDateSubsetControl from './controls/DailyDateSubsetControl';
import RangeSubsetControl from './controls/RangeSubsetControl';
import LongitudeSubsetControl from './controls/LongitudeSubsetControl';
import DepthSubsetControl from './controls/DepthSubsetControl';
import ToggleWithHelp from '../../components/ToggleWithHelp';
import styles from '../styles/DefaultSubsetControlsLayoutStyles';

const DefaultSubsetControlsLayout = ({
  optionsState, // Direct props from parent (toggle state)
  handleSwitch, // Direct props from parent (toggle handler)
  controls, // From layoutProps via React.cloneElement (filtering data)
  ...layoutProps // Any additional props from SubsetControls via React.cloneElement
}) => {
  return (
    <React.Fragment>
      <ToggleWithHelp
        downloadOption={{
          handler: handleSwitch,
          switchState: optionsState.subset,
          name: 'subset',
          label: 'Define Subset',
        }}
        description="Define a subset of the data for download by specifying time, lat, lon, and depth parameters."
      />

      <Collapse in={optionsState.subset}>
        <div style={styles.subsetStep}>
          {controls.date.data.isMonthlyClimatology ? (
            <MonthlyDateSubsetControl
              setTimeStart={controls.date.handlers.setTimeStart}
              setTimeEnd={controls.date.handlers.setTimeEnd}
              subsetState={{
                timeStart: controls.date.data.timeStart,
                timeEnd: controls.date.data.timeEnd,
              }}
            />
          ) : (
            <DailyDateSubsetControl
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
            />
          )}
          <RangeSubsetControl
            title="Latitude[°]"
            start={controls.latitude.data.latStart}
            end={controls.latitude.data.latEnd}
            setStart={controls.latitude.handlers.setLatStart}
            setEnd={controls.latitude.handlers.setLatEnd}
            min={controls.latitude.data.latMin}
            max={controls.latitude.data.latMax}
            defaultMin={-90}
            defaultMax={90}
            step={0.1}
            unit="°"
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
