// Wrapper for histogram plots

import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { connect } from 'react-redux';
import { csvFromVizRequestSend } from '../../../Redux/actions/visualization';
import { histogramStyles } from './chartStyles';
import ChartTemplate from './ChartTemplate';
import { renderDate, renderLat, renderLon, renderDepth } from './chartHelpers';
const mapDispatchToProps = {
  csvFromVizRequestSend,
};

// User for all histograms sparse or otherwise
const Histogram = (props) => {
  const { chart, chartIndex } = props;
  const { data } = chart;
  const { metadata, parameters } = data;
  const { Table_Name, Variable, Long_Name } = metadata;

  const downloadCSVArgs = [data, Table_Name, Variable, Long_Name];
  const date = renderDate(parameters);
  const lat = renderLat(parameters);
  const lon = renderLon(parameters);
  const depth = renderDepth(data);

  const histogramPlot = {
    useResizeHandler: true,
    data: [
      {
        x: data.variableValues,
        name: `${
          metadata.Long_Name.length > 60
            ? metadata.Long_Name.slice(0, 60) + '...'
            : metadata.Long_Name
        }`,
        type: 'histogram',
        marker: {
          color: '#00FFFF',
        },
      },
    ],
    layout: {
      xaxis: {
        title: `${
          metadata.Long_Name.length > 35
            ? metadata.Long_Name.slice(0, 35) + '...'
            : metadata.Long_Name
        } [${metadata.Unit}]`,
        exponentformat: 'power',
        color: '#ffffff',
      },
      yaxis: {
        color: '#ffffff',
        title: 'Count',
      },
    },
    // no config overrides, use defaults
    // provide title args, and annotation args, which will be merged in the template
    titleArgs: [metadata, date, lat, lon, depth],
    annotationArgs: [metadata.Distributor, metadata.Data_Source],
  };

  const chartConfig = {
    downloadCSVArgs,
    chartData: chart,
    chartIndex,
    chartControls: [
      // no extra chart controls for historgrams
      // download is handled by ChartTemplate
    ],
    plots: [histogramPlot],
  };

  return <ChartTemplate {...chartConfig} />;
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(histogramStyles)(Histogram));
