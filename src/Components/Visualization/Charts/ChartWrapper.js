import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { connect } from 'react-redux';
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

const ChartWrapper = ({ chart, index, classes }) => {
  let ChartComponent = getChartComponent(chart);

  // delegate render of chart to selected chart template
  return (
    <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
      <ChartComponent chart={chart} chartIndex={index} />
    </Paper>
  );
};

const mapStateToChartWrapperProps = ({ charts }) => ({

  charts,
});

export default connect(mapStateToChartWrapperProps)(
  withStyles(chartsStyles)(ChartWrapper),
);
