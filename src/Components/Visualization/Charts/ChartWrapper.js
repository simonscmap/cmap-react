import { Paper } from '@material-ui/core';
import React from 'react';
import spatialResolutions from '../../../enums/spatialResolutions';
import storedProcedures from '../../../enums/storedProcedures';
import vizSubTypes from '../../../enums/visualizationSubTypes';
import { chartsStyles } from './chartStyles';
import DepthProfileChart from './DepthProfileChart2'; // TODO
import Histogram from './Histogram2'; // TODO: switch experimental Histogram component
import SectionMapChart from './SectionMapChart2'; // TODO
import SpaceTimeChart from './SpaceTimeChart2';
import SparseMap from './SparseMap';
import TimeSeriesChart from './TimeSeriesChart2'; // TODO

// determine what type of chart to render
const getChartComponent = (chart) => {
  let storedProcedureName = chart.data.parameters.spName;
  let { spaceTime, timeSeries, depthProfile, sectionMap } = storedProcedures;
  let { sparse, histogram } = vizSubTypes;
  let { irregular } = spatialResolutions;
  let { subType } = chart;
  let { Spatial_Resolution: spatialResolution } = chart.data.metadata;

  if (storedProcedureName === spaceTime) {
    if (subType === sparse) {
      return SparseMap;
    }

    if (spatialResolution === irregular || subType === histogram) {
      return Histogram;
    }

    return SpaceTimeChart;
  }

  switch (storedProcedureName) {
    case timeSeries:
      return TimeSeriesChart;
    case depthProfile:
      return DepthProfileChart;
    case sectionMap:
      return SectionMapChart;
    default:
      return null;
  }
};

const ChartWrapper = ({ chart, index }) => {
  const classes = chartsStyles();
  let ChartComponent = getChartComponent(chart);
  // delegate render of chart to selected chart template
  return (
    <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
      <ChartComponent chart={chart} chartIndex={index} />
    </Paper>
  );
};

export const ChartWrapperWithoutPaper = ({ chart, overrides }) => {
  let ChartComponent = getChartComponent(chart);

  return <ChartComponent chart={chart} overrides={overrides} />;
};

export default ChartWrapper;
