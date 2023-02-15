// Wrapper for heatmaps and non-sparse histograms

import { withStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  default as subTypes,
  default as vizSubTypes,
} from '../../../enums/visualizationSubTypes';
import { snackbarOpen } from '../../../Redux/actions/ui';
import countWebGLContexts from '../../../Utility/countWebGLContexts';
import getChartDimensions from '../../../Utility/getChartDimensions';
import { truncate60, getLatLonTitles } from './chartHelpers';
import { spaceTimeChartStyles } from './chartStyles';
import handleChartDateString from './handleChartDatestring';
import handleXTicks from './handleXTicks';
import PaletteControl from './ChartControls/PaletteControl';
import makeSplitByDateControl from './ChartControls/SplitByDateControl';
import makeSplitByDepthControl from './ChartControls/SplitByDepthControl';
import ColorscaleRangeControl from './ChartControls/ColorscaleRangeControl';
import ChartTemplate from './ChartTemplate';

import { getHovertext_, toSetArray,
         spaceTimeGenerateHistogramPlotData,
         spaceTimeGenerateHistogramSubsetPlotsSplitByDate,
         spaceTimeGenerateHistogramSubsetPlotsSplitByDepth,
         spaceTimeGenerateHistogram2D,
} from '../../../api/myLib.js';

// helpers
const getDate = (data, splitByDate, splitByDepth, subsetIndex) => {
  let dates = Array.from(data.dates);
  let depths = Array.from(data.depths).map(parseFloat);
  return dates.length <= 1
    ? handleChartDateString(dates[0], data.hasHour, data.isMonthly)
    : !splitByDate
    ? `Averaged Values ${handleChartDateString(
        dates[0],
        data.hasHour,
        data.isMonthly,
      )} to ${handleChartDateString(
        dates[dates.length - 1],
        data.hasHour,
        data.isMonthly,
      )}`
    : splitByDepth
    ? handleChartDateString(
        dates[Math.floor(subsetIndex / depths.length)],
        data.hasHour,
        data.isMonthly,
      )
    : handleChartDateString(dates[subsetIndex], data.hasHour, data.isMonthly);
};

const getDepth = (data, subsetIndex, splitByDate, splitByDepth) => {
  let depths = Array.from(data.depths);
  let { parameters } = data;

  if (!data.hasDepth) {
    return 'Surface';
  }
  if (depths.length === 1) {
    return depths[0] + '[m]';
  }
  if (splitByDepth) {
    return depths[subsetIndex] + '[m]';
  }
  return `Averaged Values ${parameters.depth1}[m] to ${parameters.depth2}[m]`
};

const getXTicks = (data) => {
  let {
    parameters: { lon1, lon2 },
  } = data;
  return lon1 > lon2 ? handleXTicks(data) : {};
};

/* const getHovertext = (subset, data) => {
*   return subset.map((value, i) => {
*     let abs = Math.abs(value);
*     let formatter = abs > 0.01 && abs < 1000 ? '.2f' : '.2e';
*     if (value === null) {
*       return (
*         `Lat: ${format('.2f')(data.lats[i])}\xb0` +
*         `<br>` +
*         `Lon: ${
*           data.lons[i] > 180
*             ? format('.2f')(data.lons[i] - 360)
*             : format('.2f')(data.lons[i])
*         }\xb0`
*       );
*     }
*
*     return (
*       `Lat: ${format('.2f')(data.lats[i])}\xb0` +
*       `<br>` +
*       `Lon: ${
*         data.lons[i] > 180
*           ? format('.2f')(data.lons[i] - 360)
*           : format('.2f')(data.lons[i])
*       }\xb0` +
*       '<br>' +
*       `${data.parameters.fields}: ${format(formatter)(value)} [${
*         data.metadata.Unit
*       }]`
*     );
*   });
* }; */

const handleContourMap = (
  subsets,
  data,
  splitByDate,
  splitByDepth,
  palette,
  zMin,
  zMax,
) => {
  const { parameters, metadata } = data;
  const [height, width] = getChartDimensions(data);

  // Handle axis labels when crossing 180th meridian
  let xTicks = getXTicks(data);

  let contourPlotConfigs = subsets.map((subset, index) => {
    let dateTitle = getDate(data, splitByDate, splitByDepth, index);
    let depthTitle = getDepth(data, index, splitByDate, splitByDepth);
    let { latTitle, lonTitle } = getLatLonTitles(parameters);
    // let hovertext = getHovertext(subset, data);

    let uniqY = toSetArray (data.lats);
    let uniqX = toSetArray (data.lons);


    let contourPlotConfig = {
      key: index,
      useResizeHandler: true,
      style: {
        width: `${width}vw`,
        height: `${height}vw`,
        minWidth: `${width * 10}px`,
        minHeight: `${height * 10}px`,
        margin: '0 auto',
      },
      data: [
        {
          zauto: false,
          zmin: zMin,
          zmax: zMax,
          // x: data.lons,
          // y: data.lats,
          // z: subset,
          x: uniqX,
          y: uniqY,
          z: subset,
          connectgaps: false,
          autocolorscale: false,
          colorscale: palette,

          hoverinfo: 'text',
          hovertext: getHovertext_ ({ x: uniqX, y: uniqY, z: subset}),
          name: truncate60(metadata.Long_Name),
          type: 'contour',
          contours: {
            coloring: palette,
            showlabels: true,
            labelfont: {
              family: 'Raleway',
              size: 12,
              color: 'white',
            },
            labelformat: data.zMin > 1 && data.zMin < 1000 ? '.2f' : '.2e',
          },
          colorbar: {
            title: {
              text: `[${data.metadata.Unit}]`,
            },
            exponentformat: 'power',
          },
        },
      ],
      layout: {
        xaxis: { title: 'Longitude', color: '#ffffff', ...xTicks },
        yaxis: { title: 'Latitude', color: '#ffffff' },
      },
      titleArgs: [metadata, dateTitle, latTitle, lonTitle, depthTitle],
      annotationArgs: [metadata.Distributor, metadata.Data_Source],
    };
    return contourPlotConfig;
  });
  return contourPlotConfigs;
};

const handleHeatmap = (
  subsets,
  data,
  splitByDate,
  splitByDepth,
  palette,
  zMin,
  zMax,
) => {
  let { parameters, metadata } = data;
  let [height, width] = getChartDimensions(data);
  let xTicks = getXTicks(data);

  let heatmapPlotConfigs = subsets.map((subset, index) => {
    let dateTitle = getDate(data, splitByDate, splitByDepth, index);
    let depthTitle = getDepth(data, index, splitByDate, splitByDepth);
    let { latTitle, lonTitle } = getLatLonTitles(parameters);

    let uniqY = toSetArray (data.lats);
    let uniqX = toSetArray (data.lons);

    let heatmapPlotConfig = {
      key: index,
      style: {
        width: `${width}vw`,
        height: `${height}vw`,
        minWidth: `${width * 10}px`,
        minHeight: `${height * 10}px`,
      },
      useResizeHandler: true,
      data: [
        {
          zauto: false,
          zmin: zMin,
          zmax: zMax,
          zsmooth: subset.length < 20000 ? 'fast' : 'false',
          // x: data.lons,
          // y: data.lats,
          // z: subset,
          x: uniqX,
          y: uniqY,
          z: subset,
          connectgaps: false,
          name: truncate60(metadata.Long_Name),
          type: 'heatmap',
          colorscale: palette,
          autocolorscale: false,
          hoverinfo: 'text',
          // text: hovertext,
          text: getHovertext_({ z: subset, x: uniqX, y: uniqY }),
          colorbar: {
            title: {
              text: `[${data.metadata.Unit}]`,
            },
            exponentformat: 'power',
          },
        },
      ],
      layout: {
        xaxis: {
          title: 'Longitude[\xB0]',
          color: '#ffffff',
          exponentformat: 'power',
          ...xTicks,
        },
        yaxis: {
          title: 'Latitude[\xB0]',
          color: '#ffffff',
          exponentformat: 'power',
        },
      },
      titleArgs: [metadata, dateTitle, latTitle, lonTitle, depthTitle],
      annotationArgs: [metadata.Distributor, metadata.Data_Source],
    };
    console.log ('plotly params', { z: subset, x: uniqX, y: uniqY, type: 'heatmap' });
    return heatmapPlotConfig;
  });
  return heatmapPlotConfigs;
};

const mapStateToProps = (state, ownProps) => ({
  charts: state.charts,
});

const mapDispatchToProps = {
  openSnack: snackbarOpen,
};

const SpaceTimeChart = (props) => {
  let { openSnack, chart, chartIndex } = props;
  let { data, subType } = chart;
  let { dates, metadata } = data;
  let { contourMap, heatmap } = subTypes;

  console.table ('sample chart rows', data.rows.slice (0,20))

  // Control: Split by Date
  let [splitByDate, setSplitByDate] = useState(false);

  let handleSetSplitByDate = () => {
    let chartCount = dates ? dates.size : 1;

    if (subType === vizSubTypes.heatmap) {
      let availableWGLContexts = 15 - countWebGLContexts(props.charts);

      // NOTE the !splitByDate reads: "if we're about to toggle on splitByDate..."
      if (!splitByDate && chartCount * dates.size > availableWGLContexts) {
        openSnack('Warning: Exceeded available WebGL Contexts for rendering plots.');
        // NOTE allow users to try to render a split, but give a warning/explanation
        // return;
      }
    }

    if (subType === vizSubTypes.contourMap) {
      // TODO hourly
      // the assumes the date field is used for split by date
      // however, hourly datasets will be split by the hour field
      // NOTE see above re: !splitByDate
      if (!splitByDate && chartCount * dates.size > 20) {
        openSnack('Warning: Exceeded available WebGL Contexts for rendering plots.');
        // return;
      }
    }

    setSplitByDate(!splitByDate);
  };

  let splitByDateControlTuple = [
    makeSplitByDateControl([splitByDate, handleSetSplitByDate]),
  ];

  // Control: Split by Depth
  // QUESTION: why don't we guard against using too many WebGL Contexts
  // when toggling on splitByDepth, like we do for splitByDate?
  let [splitByDepth, setSplitByDepth] = useState(false);
  let splitByDepthControlTuple = [
    makeSplitByDepthControl([splitByDepth, setSplitByDepth]),
  ];

  // Control: Palette
  let [palette, setPalette] = useState('heatmap');
  let paletteControlTuple = [PaletteControl, { setPalette }];

  // Control: Range
  let [rangeValues, setRangeValues] = useState([data.zMin, data.zMax]);
  let colorscaleRangeControlTuple = [
    ColorscaleRangeControl,
    { rangeValues, setRangeValues },
  ];

  let controls = [
    paletteControlTuple,
    colorscaleRangeControlTuple,
    splitByDateControlTuple,
    splitByDepthControlTuple,
  ];

  // Generate Plot Configs

  if (subType !== contourMap && subType !== heatmap) {
    throw new Error(`Unexpected chart subType in SpaceTimeChart: ${subType}`);
  }

  let mySubsets;

  if (splitByDate) {
    mySubsets = spaceTimeGenerateHistogramSubsetPlotsSplitByDate (data.rows);
  } else if (splitByDepth) {
    mySubsets = spaceTimeGenerateHistogramSubsetPlotsSplitByDepth (data.rows);
  } else if (!data.hasDepth) {
    // handle case with no depth
    console.log ('no depth; rendening histogram in as 2D');
    mySubsets = [spaceTimeGenerateHistogram2D (data.rows)];
  } else {
    mySubsets = [spaceTimeGenerateHistogramPlotData (data.rows)];
  }

  let mapSubsets = () => {
    let handler;
    if (subType === subTypes.contourMap) {
      handler = handleContourMap;
    } else if (subType === subTypes.heatmap) {
      handler = handleHeatmap;
    }

    let [zMin, zMax] = rangeValues; // from state
    return handler.apply(null, [
      // subSets,
      mySubsets,
      data,
      splitByDate,
      splitByDepth,
      palette,
      zMin,
      zMax,
    ]);
  };

  let plots = mapSubsets();

  // Assemble Config
  let spaceTimeChartConfig = {
    downloadCSVArgs: [
      data,
      metadata.Table_Name,
      metadata.Variable,
      metadata.Long_Name,
    ],
    chartData: chart,
    chartIndex,
    chartControls: controls,
    plots,
  };

  return <ChartTemplate {...spaceTimeChartConfig} />;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(spaceTimeChartStyles)(SpaceTimeChart));
