// Wrapper for section map charts
import { withStyles } from '@material-ui/core/styles';
import { LineWeight } from '@material-ui/icons';
import { format } from 'd3-format';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import colors from '../../../enums/colors';
import visualizationSubTypes from '../../../enums/visualizationSubTypes';
import { snackbarOpen } from '../../../Redux/actions/ui';
import { useColorscaleRangeControl } from './ChartControls/ColorscaleRangeControl';
import GenericToggleControl from './ChartControls/GenericToggleControl';
import { useOrientationControl } from './ChartControls/OrientationControl';
import { usePaletteControl } from './ChartControls/PaletteControl';
import makeSplitByDateControl from './ChartControls/SplitByDateControl';
import { sectionMapChartStyles } from './chartStyles';
import ChartTemplate from './ChartTemplate';
import handleChartDateString from './handleChartDatestring';
import handleXTicks from './handleXTicks';

// helper: get x axis label
const getXAxis = (orientation) => {
  return orientation === 'zonal' ? 'Longitude' : 'Latitude';
};

// helper: get x axis ticks
const getXTicks = (data, orientation) => {
  let { parameters } = data;
  return parameters.lon1 > parameters.lon2 && orientation === 'zonal'
    ? handleXTicks(data)
    : {};
};

const getXs = (lons, lats, subsetLength, depthsLength, orientation) => {
  let xs = [];
  if (orientation === 'zonal') {
    for (let i = 0; i < subsetLength; i++) {
      xs.push(lons[Math.floor(i / depthsLength)]);
    }
  } else {
    for (let i = 0; i < subsetLength; i++) {
      xs.push(lats[Math.floor(i / depthsLength)]);
    }
  }
  return xs;
};

const getYs = (subsetLength, depths) => {
  let ys = [];
  for (let i = 0; i < subsetLength; i++) {
    ys.push(depths[i % depths.length]);
  }
  return ys;
};

const makeLatAndLonTitles = (
  parameters,
  orientation,
  splitBySpace,
  dmopfs,
  index,
) => {
  let latTitle =
    orientation === 'meridional'
      ? `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0`
      : splitBySpace
        ? dmopfs[index % dmopfs.length] + '\xb0'
        : `Averaged Values ${parameters.lat1}\xb0 to ${parameters.lat2}\xb0`;

  let lonTitle =
    orientation === 'zonal'
      ? `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`
      : splitBySpace
        ? dmopfs[index % dmopfs.length] + '\xb0'
        : `Averaged Values ${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`;
  return [latTitle, lonTitle];
};

const makeDate = (dates, data, splits, dmopfs, index) => {
  let { splitByDate, splitBySpace } = splits;
  return dates.length < 2
    ? handleChartDateString(dates[0], data.hasHour, data.isMonthly)
    : splitByDate && splitBySpace
      ? handleChartDateString(
          dates[Math.floor(index / dmopfs.length)],
          data.hasHour,
          data.isMonthly,
        )
      : splitByDate
        ? handleChartDateString(dates[index], data.hasHour, data.isMonthly)
        : 'Averaged Values ' +
          handleChartDateString(dates[0], data.hasHour, data.isMonthly) +
          ' to ' +
          handleChartDateString(
            dates[dates.length - 1],
            data.hasHour,
            data.isMonthly,
          );
};

const makeHovertext = (axisData, orientation, data) => {
  let { z, y, x } = axisData;
  let { parameters, metadata } = data;

  return z.map((value, i) => {
    if (orientation === 'zonal') {
      let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
      if (isNaN(value)) {
        return (
          `Depth: ${format('.2f')(y[i])} [m]` +
          `<br>` +
          `Lon: ${format('.2f')(x[i] > 180 ? x[i] - 360 : x[i])}\xb0`
        );
      } else {
        return (
          `Depth: ${format('.2f')(y[i])} [m]` +
          `<br>` +
          `Lon: ${format('.2f')(x[i] > 180 ? x[i] - 360 : x[i])}\xb0` +
          '<br>' +
          `${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
        );
      }
    } else {
      let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
      if (isNaN(value)) {
        return (
          `Depth: ${format('.2f')(y[i])} [m]` +
          `<br>` +
          `Lat: ${format('.2f')(x[i])}\xb0`
        );
      } else {
        return (
          `Depth: ${format('.2f')(y[i])} [m]` +
          `<br>` +
          `Lat: ${format('.2f')(x[i])}\xb0` +
          '<br>' +
          `${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
        );
      }
    }
  });
};

// data -> [plotConfigs]
const handleSectionMap = (sectionMapData) => {
  let {
    subsets,
    data,
    splitByDate,
    splitBySpace,
    orientation,
    palette,
    zMin,
    zMax,
  } = sectionMapData;

  const { parameters, metadata } = data;
  const dates = Array.from(data.dates);
  const depths = Array.from(data.depths);
  const lats = Array.from(data.lats);
  const lons = Array.from(data.lons);

  // DMOPFS = distinctMeridiansOrParallelsForSplitting
  const dmopfs = orientation === 'zonal' ? lats : lons;

  let xAxis = getXAxis(orientation);
  let xTicks = getXTicks(data, orientation);

  // map subsets
  let plotConfigs = subsets.map((subset, index) => {
    let z = subset;
    let x = getXs(lons, lats, subset.length, depths.length, orientation);
    let y = getYs(subset.length, depths);

    let [latTitle, lonTitle] = makeLatAndLonTitles(
      parameters,
      orientation,
      splitBySpace,
      dmopfs,
      index,
    );

    let date = makeDate(
      dates,
      data,
      { splitByDate, splitBySpace },
      dmopfs,
      index,
    );
    let hovertext = makeHovertext({ z, y, x }, orientation, data);

    let plotConfig = {
      style: { minWidth: '510px', minHeight: '340px' },
      useResizeHandler: true,
      data: [
        {
          zauto: false,
          zmin: zMin,
          zmax: zMax,
          connectgaps: false,
          autocolorscale: false,
          colorscale: palette,
          zsmooth: subset.length < 20000 ? 'best' : 'fast',
          x,
          y,
          z,
          name: parameters.fields,
          type:
            data.subType === visualizationSubTypes.contourSectionMap
              ? 'contour'
              : 'heatmap',
          colorbar: {
            title: {
              text: `[${metadata.Unit}]`,
            },
            exponentformat: 'power',
          },
          contours: {
            coloring: palette,
            showlabels: true,
            labelfont: {
              family: 'Raleway',
              size: 12,
              color: 'white',
            },
            labelformat: '.2e',
          },
          hoverinfo: 'text',
          hovertext,
        },
      ],
      key: index,
      layout: {
        font: { color: '#ffffff' },
        xaxis: {
          title: `${xAxis}[\xB0]`,
          color: '#ffffff',
          exponentformat: 'power',
          ...xTicks,
        },
        yaxis: {
          title: 'Depth[m]',
          color: '#ffffff',
          exponentformat: 'power',
          autorange: 'reversed',
        },
        paper_bgcolor: colors.backgroundGray,
      },
      titleArgs: [
        metadata,
        date,
        latTitle,
        lonTitle,
        `${parameters.depth1}[m] to ${parameters.depth2}[m]`,
      ],
      annotationArgs: [metadata.Distributor, metadata.Data_Source],
    };

    return plotConfig;
  });
  return plotConfigs;
};

const mapDispatchToProps = {
  snackbarOpen,
};

const SectionMapChart = (props) => {
  const { snackbarOpen, chart, chartIndex } = props;
  const { data } = chart;
  const { dates, lats, lons, metadata } = data;

  const [splitByDate, setSplitByDate] = useState(false);
  const [splitBySpace, setSplitBySpace] = useState(false);

  let [orientationControlTuple, orientation] = useOrientationControl(
    data.orientation,
  );

  let [paletteControlTuple, palette] = usePaletteControl();
  let spaces = orientation === 'zonal' ? lats : lons;

  let [colorscaleRangeControlTuple, rangeValues] = useColorscaleRangeControl([
    data.zMin,
    data.zMax,
  ]);

  // see api/SectionMapData for details on how generatePlotData works
  let subsets = data.generatePlotData(orientation, splitByDate, splitBySpace);

  // Split By Space
  let handleSetSplitBySpace = () => {
    let chartCount = splitByDate ? dates.size : 1;
    if (!splitBySpace && chartCount * spaces.size > 20) {
      snackbarOpen('Unable to split. Rendering limit exceeded.');
    } else if (spaces.size === 1) {
      snackbarOpen('Unable to split by space: only one space provided');
    } else {
      setSplitBySpace(!splitBySpace);
    }
  };
  let splitBySpaceControlTuple = [
    GenericToggleControl,
    {
      state: [splitBySpace, handleSetSplitBySpace],
      tooltip: (state) => {
        if (state) {
          return orientation === 'zonal'
            ? 'Split by Latitude'
            : 'Split by Longitude';
        } else {
          return 'Un-Split';
        }
      },
      icon: LineWeight,
    },
  ];

  // Split By Date
  let handleSetSplitByDate = () => {
    let chartCount = splitBySpace ? spaces.size : 1;
    if (!splitByDate && chartCount * dates.size > 20) {
      snackbarOpen('Unable to split. Rendering limit exceeded.');
    } else if (dates.size === 1) {
      snackbarOpen('Unable to split by date: only one date available.');
    } else {
      setSplitByDate(!splitByDate);
    }
  };
  let splitByDateControlTuple = [
    makeSplitByDateControl([splitByDate, handleSetSplitByDate]),
  ];

  let controls = [
    paletteControlTuple,
    colorscaleRangeControlTuple,
    orientationControlTuple,
    splitBySpaceControlTuple,
    splitByDateControlTuple,
  ];

  const [zMin, zMax] = rangeValues;

  let plots = handleSectionMap({
    subsets,
    data,
    splitByDate,
    splitBySpace,
    orientation,
    palette,
    zMin,
    zMax,
  });

  let sectionMapChartConfig = {
    downloadCSVArgs: [
      data,
      metadata.Table_Name,
      metadata.Variable,
      metadata.Long_Name,
    ],
    chartData: chart,
    chartIndex,
    chartControls: controls,
    plots: plots,
  };

  return <ChartTemplate {...sectionMapChartConfig} />;
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(sectionMapChartStyles)(SectionMapChart));
