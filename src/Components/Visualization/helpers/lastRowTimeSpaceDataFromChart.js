// Takes a chart object and returns an object literal describing the last row

const lastRowTimeSpaceDataFromChart = (chart) => {
  let time;
  let depth;
  if (chart.times) {
    time = chart.times[chart.times.length - 1];
    depth = chart.depths[chart.depths.length - 1];
  } else {
    let datesArray = Array.from(chart.dates);
    time = datesArray[datesArray.length - 1];

    let depthsArray = Array.from(chart.depths);
    depth = depthsArray[depthsArray.length - 1];
  }

  return {
    lat: chart.lats[chart.lats.length - 1],
    lon: chart.lons[chart.lons.length - 1],
    time,
    depth,
  };
};

export default lastRowTimeSpaceDataFromChart;
