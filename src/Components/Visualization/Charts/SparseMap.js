// Container for grouped plots for sparse data

import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { sparseMapStyles } from './chartStyles';
import getSparseScatterConfig from './SparseScatter';
import { usePaletteControl } from './ChartControls/PaletteControl';
import {
  renderDate,
  renderLat,
  renderLon,
  renderDepth,
  truncate60,
} from './chartHelpers';
import { useColorscaleRangeControl } from './ChartControls/ColorscaleRangeControl';
import { useMarkerOptions } from './ChartControls/MarkerControl';
import ChartTemplate from './ChartTemplate';

const MAP_RENDER_POINT_THRESHOLD = 20000;

const getSparseMapPlotConfig = (data, palette, zValues, overrides = {}) => {
  let { parameters, metadata } = data;
  let date = renderDate(parameters);
  let lat = renderLat(parameters);
  let lon = renderLon(parameters);
  let depth = renderDepth(data);

  let plotConfig = {
    tabTitle: 'Map',
    style: {
      width: overrides.width || '60vw',
      height: overrides.height || '40vw',
      minWidth: '510px',
      minHeight: overrides.minHeight || '340px',
    },
    data: [
      {
        zauto: false,
        zmin: zValues[0],
        zmax: zValues[1],
        lon: data.lons,
        lat: data.lats,
        z: data.variableValues,
        autocolorscale: false,
        colorscale: palette,
        radius: 6,
        name: truncate60(metadata.Long_Name),
        type: 'densitymapbox',
        colorbar: {
          title: {
            text: `[${data.metadata.Unit}]`,
          },
          exponentformat: 'power',
        },
      },
    ],
    layout: {
      mapbox: {
        style: 'white-bg',
        layers: [
          {
            sourcetype: 'raster',
            source: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            below: 'traces',
          },
        ],
        center: data.center,
        zoom: data.zoom,
      },
    },
    config: {
      mapboxAccessToken:
        'pk.eyJ1IjoiZGVuaG9sdHoiLCJhIjoiY2p1ZW9obTNhMDVxZjQzcDRvMmdlcDN2aiJ9.HvLaX2bcradeE5T-lpTc8w',
    },
    titleArgs: [metadata, date, lat, lon, depth],
    annotationArgs: [metadata.Distributor, metadata.Data_Source, overrides],
    cmapOverrides: overrides,
  };
  return plotConfig;
};

const SparseMapComponent = (props) => {
  const { chart, chartIndex, overrides = {} } = props;
  const { data } = chart;

  const { pointCount } = data;
  const { varyWithSize } = overrides;

  let [paletteControlTuple, palette] = usePaletteControl();
  let [rangeControlTuple, rangeValues] = useColorscaleRangeControl([
    data.zMin,
    data.zMax,
  ]);
  let [markerControlTuple, markerOptions] = useMarkerOptions();

  let scatterTypes = ['time', 'latitude', 'longitude'];
  if (data.hasDepth) {
    scatterTypes.push('depth');
  }
  // scatter plots use markerOptions
  let scatterPlots = scatterTypes.map((scatterType) => {
    return getSparseScatterConfig({
      data,
      scatterType,
      markerOptions,
      overrides,
    });
  });

  // map plot uses palette and colorscaleRonge controls
  let mapPlot = getSparseMapPlotConfig(data, palette, rangeValues, overrides);

  let controls = [paletteControlTuple, rangeControlTuple, markerControlTuple];

  const plots = [];

  if (pointCount && varyWithSize) {
    if (pointCount < MAP_RENDER_POINT_THRESHOLD) {
      plots.push(mapPlot);
    }
    plots.push(...scatterPlots);
  } else {
    plots.push(mapPlot);
    plots.push(...scatterPlots);
  }

  // function used by control panel to determine whether to disable a control
  // in a tabbed context; this is kludgy, and works off knowledge of the index of
  // both controls and tabs...
  // the ChartTemplate nests the contols passed to it in between default controls:
  // [ (0) Dowload CSV, ..., (n-1) Persist Mode Bar, (n) Close Chart ]
  // so we add 1 to get the index of the controls we pass
  let getShouldDisableControl =
    (totalCharts) =>
    ({ controlIndex, activeTabIndex }) => {
      switch (activeTabIndex) {
        case 0: // map
          return totalCharts > 4 ? [3].includes(controlIndex) : false; // disable markerControl
        default:
          // scatter plots
          return [1, 2].includes(controlIndex); // disable palette and rangeControl
      }
    };

  let sparseMapChartConfig = {
    downloadCSVArgs: [data, data.csvDownloadArgs],
    chartData: chart,
    chartIndex,
    chartControls: controls,
    isTabbedContent: true, // each plot has a 'tabTitle' property
    getShouldDisableControl: getShouldDisableControl(plots.length),
    plots,
  };

  return <ChartTemplate {...sparseMapChartConfig} />;
};

const SparseMap = React.memo(SparseMapComponent);
SparseMap.displayName = 'SparseMap';

export default withStyles(sparseMapStyles)(SparseMap);
