// Wrapper component for depth profile

import { withStyles } from '@material-ui/core/styles';
import { format } from 'd3-format';
import React from 'react';
import Plot from 'react-plotly.js';
import { connect } from 'react-redux';
import { setLoadingMessage } from '../../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../../Redux/actions/visualization';
import chartBase from './chartBase';
import handleChartDateString from './handleChartDatestring';
import ChartControlPanel from './ChartControlPanel';
import { depthProfileChartStyles } from './chartStyles';

const mapDispatchToProps = {
  setLoadingMessage,
  csvFromVizRequestSend,
};

const DepthProfileChart = (props) => {
  const { csvFromVizRequestSend, chart } = props;
  const { data } = chart;
  const { stds, variableValues, depths, parameters, metadata } = data;

  const [showLines, setShowLines] = React.useState(true);
  const [showErrorBars, setShowErrorBars] = React.useState(
    variableValues && variableValues.length <= 40 ? true : false,
  );

  var infoObject = data;

  const [markerOptions, setMarkerOptions] = React.useState({
    opacity: 0.2,
    color: '#ff1493',
    size: 6,
  });

  let hovertext = variableValues.map((value, i) => {
    return `Depth: ${format('.2f')(depths[i])} [m] <br>${
      parameters.fields
    }: ${format('.2e')(value)} \xb1 ${format('.2e')(stds[i])} [${
      metadata.Unit
    }]`;
  });

  const downloadCsv = () => {
    csvFromVizRequestSend(
      data,
      metadata.Table_Name,
      metadata.Variable,
      metadata.Long_Name,
    );
  };

  const handleMarkerOptionsConfirm = (values) => {
    props.setLoadingMessage('Re-rendering');
    setTimeout(() => {
      window.requestAnimationFrame(() => props.setLoadingMessage(''));
      setMarkerOptions(values);
    }, 100);
  };

  const handleSetShowLines = (value) => {
    props.setLoadingMessage('Re-rendering');
    setTimeout(() => {
      window.requestAnimationFrame(() => props.setLoadingMessage(''));
      setShowLines(value);
    }, 50);
  };

  const handleSetShowErrorBars = (value) => {
    props.setLoadingMessage('Re-rendering');
    setTimeout(() => {
      window.requestAnimationFrame(() => props.setLoadingMessage(''));
      setShowErrorBars(value);
    }, 50);
  };

  const date1 = infoObject.isMonthly
    ? new Date(parameters.dt1).getMonth() + 1
    : parameters.dt1;
  const date2 = infoObject.isMonthly
    ? new Date(parameters.dt2).getMonth() + 1
    : parameters.dt2;

  const date =
    date1 === date2
      ? handleChartDateString(date1, infoObject.hasHour, infoObject.isMonthly)
      : handleChartDateString(date1, infoObject.hasHour, infoObject.isMonthly) +
        ' to ' +
        handleChartDateString(date2, infoObject.hasHour, infoObject.isMonthly);
  return (
    <div>
      <ChartControlPanel
        downloadCsv={downloadCsv}
        handleMarkerOptionsConfirm={handleMarkerOptionsConfirm}
        markerOptions={markerOptions}
        showErrorBars={showErrorBars}
        handleSetShowErrorBars={handleSetShowErrorBars}
        showLines={showLines}
        handleSetShowLines={handleSetShowLines}
        chart={props.chart}
      />
      <Plot
        style={{
          position: 'relative',
          width: '60vw',
          height: '40vw',
        }}
        useResizeHandler={true}
        data={[
          {
            // mode: 'lines+markers',
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
            // type: 'scatter',
            type: variableValues.length > 10000 ? 'scattergl' : 'scatter',

            marker: {
              line: { color: markerOptions.color },
              opacity: markerOptions.opacity,
              size: markerOptions.size,
              color: markerOptions.color,
            },

            hoverinfo: 'text',
            hovertext,
          },
        ]}
        config={{ ...chartBase.config }}
        layout={{
          ...chartBase.layout,
          title: chartBase.title(
            metadata,
            date,
            `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0 `,
            `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`,
            `${parameters.depth1}[m] to ${parameters.depth2}[m]`,
          ),
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
          annotations: chartBase.annotations(
            metadata.Distributor,
            metadata.Data_Source,
          ),
        }}
      />
    </div>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(depthProfileChartStyles)(DepthProfileChart));
