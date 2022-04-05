// Webgl visualizations consume a webgl context which are limited by the browser. We use this to prevent people
// from exceeding the limit and breaking existing plots

import visualizationSubTypes from '../enums/visualizationSubTypes';

export default (charts) => {
  let count = 0;
  charts.forEach((chart) => {
    if (chart.subType === visualizationSubTypes.heatmap) count++;
    if (chart.subType === visualizationSubTypes.sparse) {
      count++;
      if (chart.data.variableValues.length > 10000) count += 3;
    }
    if (
      chart.subType === visualizationSubTypes.depthProfile &&
      chart.data.variableValues.length > 10000
    )
      count++;
    if (
      chart.subType === visualizationSubTypes.timeSeries &&
      chart.data.variableValues.length > 10000
    )
      count++;
  });
  return count;
};
