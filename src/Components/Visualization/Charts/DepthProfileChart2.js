// Wrapper component for depth profile

import { withStyles } from '@material-ui/core/styles';
import { format } from 'd3-format';
import React from 'react';
import handleChartDateString from './handleChartDatestring';
import { depthProfileChartStyles } from './chartStyles';
import ErrorBars from './ChartControls/ErrorBars';
import GenericToggleControl from './ChartControls/GenericToggleControl';
import MarkerOptions from './ChartControls/MarkerOptions';
import { ShowChart } from '@material-ui/icons';
import ChartTemplate from './ChartTemplate';

let makeHovertext = (data) => {
  let { variableValues, depths, parameters, metadata, stds } = data;
  return variableValues.map((value, i) => {
    return `Depth: ${format('.2f')(depths[i])} [m] <br>${
      parameters.fields
    }: ${format('.2e')(value)} \xb1 ${format('.2e')(stds[i])} [${
      metadata.Unit
    }]`;
  });
};

const renderDate = (data) => {
  const date1 = data.isMonthly
    ? new Date(data.parameters.dt1).getMonth() + 1
    : data.parameters.dt1;
  const date2 = data.isMonthly
    ? new Date(data.parameters.dt2).getMonth() + 1
    : data.parameters.dt2;

  return date1 === date2
    ? handleChartDateString(date1, data.hasHour, data.isMonthly)
    : handleChartDateString(date1, data.hasHour, data.isMonthly) +
        ' to ' +
        handleChartDateString(date2, data.hasHour, data.isMonthly);
};

const DepthProfileChart = (props) => {
  const { chart, chartIndex } = props;
  const { data } = chart;
  const { stds, variableValues, depths, parameters, metadata } = data;

  // Show Lines Control
  const [showLines, setShowLines] = React.useState(true);
  let showLinesArgs = {
    tooltipConfig: {
      whenOff: 'Show Plot Lines',
      whenOn: 'Hide Plot Lines',
    },
    setToggleState: setShowLines,
    toggleState: showLines,
    icon: ShowChart,
  };
  let showLinesTuple = [GenericToggleControl, showLinesArgs];

  // Show Error Bars Cotrol
  const [showErrorBars, setShowErrorBars] = React.useState(
    variableValues && variableValues.length <= 40 ? true : false,
  );
  let errorBarArgs = { setVisible: setShowErrorBars, visible: showErrorBars };
  let showErrorBarsTuple = [ErrorBars, errorBarArgs];

  // Show Marker Options
  const [markerOptions, setMarkerOptions] = React.useState({
    opacity: 0.2,
    color: '#ff1493',
    size: 6,
  });
  let markerOptionsTuple = [MarkerOptions, { setMarkerOptions, markerOptions }];

  // Aggregated Controls:
  let controls = [showErrorBarsTuple, showLinesTuple, markerOptionsTuple];

  // Config

  let date = renderDate(data);

  const depthProfilePlot = {
    useResizeHandler: true,
    data: [
      {
        mode: showLines ? 'lines+markers' : 'markers',
        y: depths,
        x: variableValues,
        error_x: {
          type: 'data',
          array: stds,
          opacity: 0.3,
          color: showErrorBars ? '#f2f2f2' : 'transparent',
          visible: true,
        },
        name: `${
          metadata.Long_Name.length > 60
            ? metadata.Long_Name.slice(0, 60) + '...'
            : metadata.Long_Name
        }`,
        type: variableValues.length > 10000 ? 'scattergl' : 'scatter',
        marker: {
          line: { color: markerOptions.color },
          opacity: markerOptions.opacity,
          size: markerOptions.size,
          color: markerOptions.color,
        },
        hoverinfo: 'text',
        hovertext: makeHovertext(data),
      },
    ],
    layout: {
      yaxis: {
        title: 'Depth[m]',
        color: '#ffffff',
        exponentformat: 'power',
        autorange: 'reversed',
      },
      xaxis: {
        title: `${
          metadata.Long_Name.length > 35
            ? metadata.Long_Name.slice(0, 35) + '...'
            : metadata.Long_Name
        } [${metadata.Unit}]`,
        color: '#ffffff',
        exponentformat: 'power',
      },
    },
    titleArgs: [
      metadata,
      date,
      `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0 `,
      `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`,
      `${parameters.depth1}[m] to ${parameters.depth2}[m]`,
    ],
    annotationArgs: [metadata.Distributor, metadata.Data_Source],
  };

  const chartConfig = {
    downloadCSVArgs: [
      data,
      metadata.Table_Name,
      metadata.Variable,
      metadata.Long_Name,
    ],
    chartData: chart,
    chartIndex,
    chartControls: controls,
    plots: [depthProfilePlot],
  };

  return <ChartTemplate {...chartConfig} />;
};

export default withStyles(depthProfileChartStyles)(DepthProfileChart);
