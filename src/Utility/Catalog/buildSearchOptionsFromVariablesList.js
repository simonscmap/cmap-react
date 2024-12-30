// Creates an object describing distinct values for each column
// Is run for each search result
//
import initLogger from '../../Services/log-service';
const log = initLogger('buildSearchOptionsFromVariableList');

const buildSearchOptionsFromVariableList = (
  variables,
  storedOptions = {},
  params = {},
) => {

  let options = {
    Sensor: new Set(),
    Temporal_Resolution: new Set(['Any']),
    Spatial_Resolution: new Set(['Any']),
    Data_Source: new Set(['Any']),
    Distributor: new Set(['Any']),
    Process_Level: new Set(['Any']),
    Make: new Set(),
    DataFeatures: new Set(),
  };

  const columns = Object.keys(options);
  // log.debug('columns', columns);

  variables.forEach((v) => {
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

  // Sensor
  if (params.sensor && params.sensor.size) {
    options.Sensor = storedOptions.Sensor;
  }

  // Make
  if (params.make && params.make.size) {
    options.Make = storedOptions.Make;
  }

  // Region
  if (params.region && params.region.size) {
    options.Region = storedOptions.Region;
  } else {
    let regions = new Set();
    variables.forEach((v) => {
      if (v.Regions) {
        v.Regions.split(',').forEach((r) => regions.add(r));
      }
    });

    options.Region = Array.from(regions).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  return options;
};

export default buildSearchOptionsFromVariableList;
