// Chart Helpers
// common functions used by most chart components
import handleChartDateString from './handleChartDatestring';

// chart.parameters -> date string
export const renderDate = (parameters) => {
  return parameters.dt1 === parameters.dt2
    ? handleChartDateString(parameters.dt1)
    : handleChartDateString(parameters.dt1) +
        ' to ' +
        handleChartDateString(parameters.dt2);
};

export const getLatLonTitles = (parameters) => {
  let { lat1, lat2, lon1, lon2 } = parameters;
  let latTitle = lat1 === lat2 ? `${lat1}\xb0` : `${lat1}\xb0 to ${lat2}\xb0`;
  let lonTitle = lon1 === lon2 ? `${lon1}\xb0` : `${lon1}\xb0 to ${lon2}\xb0`;
  return { latTitle, lonTitle };
};

// chart.parameters -> latitude label
export const renderLat = (parameters) => {
  return parameters.lat1 === parameters.lat2
    ? parameters.lat1 + '\xb0'
    : parameters.lat1 + '\xb0 to ' + parameters.lat2 + '\xb0';
};

// chart.parameters -> longitude label
export const renderLon = (parameters) => {
  return parameters.lon1 === parameters.lon2
    ? parameters.lon1 + '\xb0'
    : parameters.lon1 + '\xb0 to ' + parameters.lon2 + '\xb0';
};

// chart.parameters.data -> depth label
export const renderDepth = (data) => {
  let { parameters } = data;
  return !data.hasDepth
    ? 'Surface'
    : parameters.depth1 === parameters.depth2
    ? `${parameters.depth1}[m]`
    : `${parameters.depth1}[m] to ${parameters.depth2}[m]`;
};

export const truncateString = (limit) => (str) => {
  let parsedLimit = parseInt(limit);
  if (typeof parsedLimit !== 'number' || typeof str !== 'string') {
    throw new Error('Wrong type arguments to truncate string');
  }
  if (str.length > limit) {
    return str.slice(0, limit) + '...';
  }
  return str;
}

export const truncate60 = truncateString(60);

export const capitalizeFirst = (str) => {
  if (!str || !str.length) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
