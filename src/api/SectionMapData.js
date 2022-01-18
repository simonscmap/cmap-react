import { quantile, extent } from 'd3-array';

import flattenArray from '../Utility/flattenArray';
import splitData from '../Utility/splitData';
import mergeArraysAndComputeMeans from '../Utility/mergeArraysAndComputeMeans';
import temporalResolutions from '../enums/temporalResolutions';

class SectionMapData {
  constructor(payload) {
    this.parameters = payload.parameters;
    this.metadata = payload.metadata;
    this.subType = payload.subType;

    this.dates = new Set();
    this.depths = new Set();
    this.lats = new Set();
    this.lons = new Set();

    this.lonMin = null;
    this.lonMax = null;

    this.variableValues = [];

    this.zMin = null;
    this.zMax = null;
    this.extent = [null, null];

    this.orientation = null;
  }

  // time, lat, lon, depth, value
  add(row) {
    const time = row[0];
    const lat = parseFloat(row[1]);
    var _lon = parseFloat(row[2]);
    const lon = _lon < this.parameters.lon1 ? _lon + 360 : _lon;
    const depth = parseFloat(row[3]);
    const value = parseFloat(row[4]);

    if (this.variableValues.length === 0) {
      this.isMonthly =
        this.metadata.Temporal_Resolution ===
        temporalResolutions.monthlyClimatology;
    }

    this.depths.add(depth);
    this.dates.add(time);
    this.lats.add(lat);
    this.lons.add(lon);

    this.variableValues.push(value);
  }

  finalize() {
    let quantile1 = quantile(this.variableValues, 0.05);
    let quantile2 = quantile(this.variableValues, 0.95);
    this.zMin =
      quantile1 === undefined ? null : parseFloat(quantile1.toPrecision(4));
    this.zMax =
      quantile2 === undefined ? null : parseFloat(quantile2.toPrecision(4));

    this.extent = extent(this.variableValues);

    this.orientation = this.lons.size > this.lats.size ? 'zonal' : 'meridional';

    let lonArray = Array.from(this.lons);
    this.lonMax = Math.max(...lonArray);
    this.lonMin = Math.min(...lonArray);
  }

  // Direction is meridional or zonal
  generatePlotData(orientation, splitByDate, splitBySpace) {
    let latCount = this.lats.size;
    let lonCount = this.lons.size;

    // Intervals are the number of indices between each change for that parameter
    // Intervals can change if you split out of order
    const lonInterval = this.depths.size;
    const latInterval = lonInterval * lonCount;
    const dateInterval = latInterval * latCount;

    var variableValueSubsets = splitData(
      this.variableValues,
      dateInterval,
      this.dates.size,
    );

    var spaceCount;

    if (orientation === 'zonal') {
      variableValueSubsets = variableValueSubsets.map((subset) =>
        splitData(subset, latInterval, latCount),
      );
      variableValueSubsets = flattenArray(variableValueSubsets);
      spaceCount = latCount;
    } else {
      variableValueSubsets = variableValueSubsets.map((subset) =>
        splitData(subset, lonInterval, lonCount),
      );
      variableValueSubsets = flattenArray(variableValueSubsets);
      spaceCount = lonCount;
    }

    if (splitByDate && splitBySpace) {
      // pass
    } else if (splitByDate) {
      variableValueSubsets = mergeArraysAndComputeMeans(
        variableValueSubsets,
        1,
        spaceCount,
        spaceCount,
      );
    } else if (splitBySpace) {
      variableValueSubsets = mergeArraysAndComputeMeans(
        variableValueSubsets,
        spaceCount,
        1,
        this.dates.size,
      );
    } else {
      variableValueSubsets = mergeArraysAndComputeMeans(
        variableValueSubsets,
        1,
        variableValueSubsets.length,
        variableValueSubsets.length,
      );
    }

    return variableValueSubsets;
  }

  generateCsv = () => {
    let dates = Array.from(this.dates);
    let depths = Array.from(this.depths);
    let lons = Array.from(this.lons);
    let lats = Array.from(this.lats);

    const lonInterval = depths.length;
    const latInterval = lonInterval * lons.length;

    var csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

    for (let i = 0; i < this.variableValues.length; i++) {
      csvArray.push(
        `${
          dates[Math.floor(i / (this.variableValues.length / dates.length))]
        },${lats[Math.floor(i / latInterval) % lats.length]},${
          lons[Math.floor(i / lonInterval) % lons.length]
        },${depths[i % depths.length]},${
          isNaN(this.variableValues[i]) ? '' : this.variableValues[i]
        }`,
      );
    }

    return csvArray.join('\n');
  };
}

export default SectionMapData;
