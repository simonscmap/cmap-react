// Creates an object describing distinct values for each column
// Is run for each search result
//

const buildSearchOptionsFromDatasetList = (
  datasets,
  storedOptions = {},
  params = {},
) => {
  let options = {
    Temporal_Resolution: new Set(['Any']),
    Spatial_Resolution: new Set(['Any']),
    Data_Source: new Set(['Any']),
    Distributor: new Set(['Any']),
    Process_Level: new Set(['Any']),
    Make: new Set(),
  };

  const columns = Object.keys(options);

  datasets.forEach((v) => {
    columns.forEach((k) => {
      if (v[k]) {
        options[k].add(v[k]);
      }
    });
  });

  columns.forEach((col) => {
    options[col] = Array.from(options[col]).sort(function (a, b) {
      try {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      } catch (e) {
        console.log(e);
      }
    });
  });

  if (params.sensor && params.sensor.length && storedOptions.Sensor.length) {
    options.Sensor = storedOptions.Sensor;
  } else {
    let sensors = new Set();
    datasets.forEach((d) => {
      if (d.Sensors) {
        d.Sensors.forEach((s) => sensors.add(s));
      }
    });

    options.Sensor = Array.from(sensors).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  if (params.make && params.make.length && storedOptions.Make.length) {
    options.Make = storedOptions.Make;
  }

  if (params.region && params.region.length && storedOptions.Region.length) {
    options.Region = storedOptions.Region;
  } else {
    let regions = new Set();
    datasets.forEach((d) => {
      if (d.Regions) {
        d.Regions.split(',').forEach((r) => regions.add(r));
      }
    });

    options.Region = Array.from(regions).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }
  return options;
};

export default buildSearchOptionsFromDatasetList;
