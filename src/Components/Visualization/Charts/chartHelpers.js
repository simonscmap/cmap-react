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
