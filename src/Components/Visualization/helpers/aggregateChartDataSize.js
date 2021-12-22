// count all the variable values for all the currently rendered charts
// supports a check that will display message to the user indicating
// that they have exceeded a data limit and to delete plots
const aggregateChartDataSize = (charts) => {
  let size = 0;

  charts.forEach((ch) => {
    size +=
      ch.data.variableValues && ch.data.variableValues.length
        ? ch.data.variableValues.length
        : 0;
  });

  return size;
};

export default aggregateChartDataSize;
