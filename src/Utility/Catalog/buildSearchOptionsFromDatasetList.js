// Creates an object describing distinct values for each filterable column
// Is run for each search result
import initLogger from '../../Services/log-service';
const log = initLogger('buildSearchOptionsFromDatasetList');

const buildSearchOptionsFromDatasetList = (
  datasets, // results from the database query
  storedOptions = {}, // from redux state (what this function's return value will update)
  params = {}, // from the queryString passed to searchResultsFetch
) => {
  // create an options object
  // this object is what we will return, after updating each key
  // NOTE each value needs to end up as an Array
  let options = {
    Temporal_Resolution: new Set(['Any']),
    Spatial_Resolution: new Set(['Any']),
    Data_Source: new Set(['Any']),
    Distributor: new Set(['Any']),
    Process_Level: new Set(['Any']),
    Make: new Set(), // special case
    // Sensors is special case below
    // Region is special case
    DataFeatures: new Set(),
  };

  const columns = Object.keys(options);

  // iterate through each dataset, and each column,
  // adding values to the Set under that key in the options object
  datasets.forEach((dataset) => {
    columns.forEach((column) => {
      if (dataset[column]) {
        if (Array.isArray(dataset[column])) {
          dataset[column].forEach(item => options[column].add(item));
        } else {
          options[column].add(dataset[column]);
        }
      }
    });
  });

  // for each column, update the options for that key to be a sorted array
  // basically converting from Set to Array
  columns.forEach((col) => {
    let optionsForColumn = Array.from(options[col]);
    if (optionsForColumn.length < 2) {
      options[col] = optionsForColumn;
    }
    options[col] = Array.from(options[col]).sort(function (a, b) {
      /* if (typeof a !== 'string' || typeof b !== 'string') {
       *   log.debug('failed to sort: values not type string', {a, b, col});
       *   return true;
       * } */
      try {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      } catch (e) {
        log.debug ('failed to cmapare columns', { col, a, b });
      }
    });
  });

  // NOTE
  // All subsequent updates to specific keys of the options object ALSO serve to
  // convert from Set to Array

  // NOTE
  // The behavior that these udpates effect is highly particular particular.
  // Read the catalog-doc.md for a description.

  // NOTE
  // The Make and DataFeatures option sets behave similarly,
  // And the Sensors and Regions option sets behave similarly;

  // Make
  if (params.make && params.make.length && storedOptions.Make.length) {
    // overwrite the Make option with already stored option
    options.Make = storedOptions.Make;
  } else {
    // Make options will default to an empty array, per the iteration on `columns` above
  }

  // DataFeatures
  if (params.dataFeatures && params.dataFeatures.length && storedOptions.DataFeatures.length) {
    log.debug ('converting options.DataFeatures to array', {
      DataFeatures: options.DataFeatures
    });
    options.DataFeatures = Array.from(options.DataFeatures);
  } else {
    // DataFeatures will default to an empty array, per the iteration on `columns` above
  }

  // Sensors
  // takes stored sensor options, if they exist;
  // otherwise rebuilds the set converts from Set to Array
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

  // Region
  // takes stored region options, if they exist;
  // otherwise rebuilds the set converts from Set to Array
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
