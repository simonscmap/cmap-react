import React from 'react';
import { Collapse } from '@material-ui/core';

import MonthlyDateSubsetControl from './controls/MonthlyDateSubsetControl';
import DateRangeControl from './controls/DateRangeControl';
import RangeSubsetControl from './controls/RangeSubsetControl';
import ToggleWithHelp from '../../components/ToggleWithHelp';
import styles from '../styles/DefaultSubsetControlsLayoutStyles';
import { dayToDateString, extractDateFromString } from '../utils/dateHelpers';

const DefaultSubsetControlsLayout = ({
  optionsState, // Direct props from parent (toggle state)
  handleSwitch, // Direct props from parent (toggle handler)
  controls, // From layoutProps via React.cloneElement (filtering data)
  ...layoutProps // Any additional props from SubsetControls via React.cloneElement
}) => {
  // Helper functions to convert between day numbers and Date objects
  const dayNumberToDate = (dayNumber, timeMin) => {
    if (dayNumber === null || dayNumber === undefined || !timeMin) return null;
    try {
      const dateString = dayToDateString(timeMin, dayNumber);
      return extractDateFromString(dateString);
    } catch (error) {
      return null;
    }
  };

  const dateToDayNumber = (date, timeMin) => {
    if (!date || !timeMin) return null;
    try {
      return Math.ceil(
        (date.getTime() - new Date(timeMin).getTime()) / 86400000,
      );
    } catch (error) {
      return null;
    }
  };

  // Convert day numbers to Date objects for the new DateRangeControl API
  const startDate = dayNumberToDate(
    controls.date.data.timeStart,
    controls.date.data.timeMin,
  );
  const endDate = dayNumberToDate(
    controls.date.data.timeEnd,
    controls.date.data.timeMin,
  );
  const minDate = dayNumberToDate(0, controls.date.data.timeMin);
  const maxDate = dayNumberToDate(
    controls.date.data.maxDays,
    controls.date.data.timeMin,
  );

  // Wrapper handlers to convert Date objects back to day numbers
  const handleStartDateChange = (date) => {
    const dayNumber = dateToDayNumber(date, controls.date.data.timeMin);
    controls.date.handlers.setTimeStart(dayNumber);
  };

  const handleEndDateChange = (date) => {
    const dayNumber = dateToDayNumber(date, controls.date.data.timeMin);
    controls.date.handlers.setTimeEnd(dayNumber);
  };
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
            <DateRangeControl
              title="Date"
              startDate={startDate}
              endDate={endDate}
              minDate={minDate}
              maxDate={maxDate}
              onStartChange={handleStartDateChange}
              onEndChange={handleEndDateChange}
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
            step={0.1}
            unit="°"
          />
          <RangeSubsetControl
            title="Longitude[°]"
            start={controls.longitude.data.lonStart}
            end={controls.longitude.data.lonEnd}
            setStart={controls.longitude.handlers.setLonStart}
            setEnd={controls.longitude.handlers.setLonEnd}
            min={controls.longitude.data.lonMin}
            max={controls.longitude.data.lonMax}
            step={0.1}
            unit="°"
          />
          <RangeSubsetControl
            title="Depth[m]"
            start={controls.depth.data.depthStart}
            end={controls.depth.data.depthEnd}
            setStart={controls.depth.handlers.setDepthStart}
            setEnd={controls.depth.handlers.setDepthEnd}
            min={controls.depth.data.depthMin}
            max={controls.depth.data.depthMax}
            step={1}
            unit="m"
          />
        </div>
      </Collapse>
    </React.Fragment>
  );
};

export default DefaultSubsetControlsLayout;
