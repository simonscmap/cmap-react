// Wrapper for scatter / line plots

import { format } from 'd3-format';

import {
  renderDate,
  renderLat,
  renderLon,
  renderDepth,
  truncate60,
  capitalizeFirst,
} from './chartHelpers';

const getHovertext = (data, scatterType) => {
  let { variableValues, times, parameters, metadata, lats, lons, depths } =
    data;

  switch (scatterType) {
    case 'latitude':
      return variableValues.map((value, i) => {
        let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
        return `Lat: ${lats[i].toFixed(2)}<br>${parameters.fields}: ${format(
          formatter,
        )(value)} [${metadata.Unit}]`;
      });

    case 'longitude':
      return variableValues.map((value, i) => {
        let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
        return `Lon: ${lons[i].toFixed(2)}<br>${parameters.fields}: ${format(
          formatter,
        )(value)} [${metadata.Unit}]`;
      });

    case 'depth':
      return variableValues.map((value, i) => {
        let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
        return `Depth: ${depths[i].toFixed(2)}<br>${
          parameters.fields
        }: ${format(formatter)(value)} [${metadata.Unit}]`;
      });

    case 'time':
    default:
      return variableValues.map((value, i) => {
        let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
        let time = times[i].slice(0, 20);
        time = time.replace('T', ' ');
        return `Time: ${time}<br>${parameters.fields}: ${format(formatter)(
          value,
        )} [${metadata.Unit}]`;
      });
  }
};

// data -> scatterType -> { x, y }
const getValues = (data, scatterType) => {
  switch (scatterType) {
    case 'latitude':
      return { x: data.lats, y: data.variableValues };
    case 'longitude':
      return { x: data.lons, y: data.variableValues };
    case 'depth':
      return { x: data.variableValues, y: data.depths };
    case 'time':
    default:
      return { x: data.times, y: data.variableValues };
  }
};

// data -> scatterType -> [x title, y title]
const getTitles = (data, scatterType) => {
  let scatterTypeTitle = capitalizeFirst(scatterType);
  let {
    metadata: { Long_Name },
  } = data;
  switch (scatterType) {
    case 'depth':
      return [truncate60(Long_Name), 'Depth[m]'];
    case 'time':
    case 'latitude':
    case 'longitude':
    default:
      return [scatterTypeTitle, truncate60(Long_Name)];
  }
};

const getSparseScatterConfig = (props) => {
  const { markerOptions, data, scatterType } = props;

  const { parameters, metadata, variableValues } = data;

  let hovertext = getHovertext(data, scatterType);
  let date = renderDate(parameters);
  let lat = renderLat(parameters);
  let lon = renderLon(parameters);
  let depth = renderDepth(data);
  let { x, y } = getValues(data, scatterType);
  let [xTitle, yTitle] = getTitles(data, scatterType);

  let plot = {
    tabTitle: capitalizeFirst(scatterType),
    style: {
      width: '60vw',
      height: '40vw',
    },
    data: [
      {
        x,
        y,
        mode: 'markers',
        name: truncate60(metadata.Long_Name),
        type: variableValues.length > 10000 ? 'scattergl' : 'scatter',
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
        title: xTitle,
        color: '#ffffff',
        exponentformat: 'power',
      },
      yaxis: {
        title: yTitle,
        color: '#ffffff',
        exponentformat: 'power',
        autorange: scatterType === 'depth' ? 'reversed' : true,
      },
    },
    titleArgs: [metadata, date, lat, lon, depth],
    annotationArgs: [metadata.Distributor, metadata.Data_Source],
  };

  return plot;
};

export default getSparseScatterConfig;
