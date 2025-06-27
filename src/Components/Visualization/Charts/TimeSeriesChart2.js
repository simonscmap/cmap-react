// Wrapper for time series
import { withStyles } from '@material-ui/core/styles';
import { format } from 'd3-format';
import React from 'react';
import months from '../../../enums/months';
import { useErrorBarControl } from './ChartControls/ErrorBarControl';
import { useLineControl } from './ChartControls/LinesControl';
import { useMarkerOptions } from './ChartControls/MarkerControl';
import {
  renderDepth,
  renderLat,
  renderLon,
  truncate60,
  truncateString,
} from './chartHelpers';
import { timeSeriesChartStyles } from './chartStyles';
import ChartTemplate from './ChartTemplate';
import handleChartDateString from './handleChartDatestring';

// chart.data -> [string]
let makeHovertext = (data) => {
  let { variableValues, parameters, dates, stds, metadata } = data;
  return variableValues.map((value, i) => {
    return `Time: ${dates[i].slice(0, 10)}<br>${parameters.fields}: ${format(
      '.2e',
    )(value)} \xb1 ${format('.2e')(stds[i])} [${metadata.Unit}]`;
  });
};

const TimeSeriesChart = (props) => {
  const { chart, chartIndex } = props;
  const { data } = chart;
  const { stds, variableValues, dates, parameters, metadata } = data;

  // Show Lines Control
  let [showLinesControlTuple, showLines] = useLineControl();

  // Show Error Bars Cotrol
  let [errorBarsControlTuple, showErrorBars] = useErrorBarControl();

  // Show Marker Options
  let [markerOptionsControlTuple, markerOptions] = useMarkerOptions();

  // Aggregated Controls:
  let controls = [
    errorBarsControlTuple,
    showLinesControlTuple,
    markerOptionsControlTuple,
  ];

  let hovertext = makeHovertext(data);

  // this date label is specific to timeseries
  let date =
    parameters.dt1 === parameters.dt2
      ? handleChartDateString(dates[0], data.hasHour, data.isMonthly)
      : handleChartDateString(dates[0], data.hasHour, data.isMonthly) +
        ' to ' +
        handleChartDateString(
          dates[dates.length - 1],
          data.hasHour,
          data.isMonthly,
        );

  let lat = renderLat(parameters);
  let lon = renderLon(parameters);
  let depth = renderDepth(parameters);
  let x = data.isMonthly ? dates.map((date) => months[parseInt(date)]) : dates;

  // Time Series Plot Configuration
  let timeSeriesPlotConfig = {
    useResizeHandler: true,
    data: [
      {
        mode: showLines ? 'lines+markers' : 'markers',
        x: x,
        y: variableValues,
        error_y: {
          type: 'data',
          array: stds,
          opacity: 0.3,
          color: showErrorBars ? '#f2f2f2' : 'transparent',
          visible: true,
        },
        name: truncate60(metadata.Long_Name),
        type: variableValues.length > 10000 ? 'scattergl' : 'scatter',
        line: { color: markerOptions.color },
        marker: {
          opacity: markerOptions.opacity,
          size: markerOptions.size,
          color: markerOptions.color,
        },
        hoverinfo: 'text',
        hovertext,
      },
    ],
    layout: {
      xaxis: {
        title: data.isMonthy ? 'Month' : 'Time',
        color: '#ffffff',
        exponentformat: 'power',
      },
      yaxis: {
        title: `${truncateString(35)(metadata.Long_Name)} [${metadata.Unit}]`,
        color: '#ffffff',
        exponentformat: 'power',
      },
    },
    titleArgs: [metadata, date, lat, lon, depth],
    annotationArgs: [metadata.Distributor, metadata.Data_Source],
  };

  const timeSeriesConfig = {
    downloadCSVArgs: [data, data.csvDownloadArgs],
    chartData: chart,
    chartIndex,
    chartControls: controls,
    plots: [timeSeriesPlotConfig],
  };

  return <ChartTemplate {...timeSeriesConfig} />;
};

export default withStyles(timeSeriesChartStyles)(TimeSeriesChart);
