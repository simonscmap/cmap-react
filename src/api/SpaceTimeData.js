import { quantile, extent } from 'd3-array';

import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import flattenArray from '../Utility/flattenArray';
import splitData from '../Utility/splitData';
import mergeArraysAndComputeMeans from '../Utility/mergeArraysAndComputeMeans';
import mergeArrays from '../Utility/mergeArrays';

import vizSubTypes from '../enums/visualizationSubTypes';
import temporalResolutions from '../enums/temporalResolutions';

import { /* subsetKey, mapDeep, rowToVal, sum, toMean3D, */ roundToDecimal } from './myLib.js';
import lodash from 'lodash';

// generate a rounding function that rounds floats to the 3rd decimal place,
// and use lodash.memoize to cache results, since for large datasets, we'll
// see many of the same values for longitudes or latitudes
// NOTE declaring it at the module level means the memo cache will work
// across charts & queries; this will benefit a user that renders
// multiple charts along the case lon/lat constraints, but will also
// potentially consume a lange amount of memory;

// const roundToThousandths = lodash.memoize (roundToDecimal (3));

// const isHourly = (tableName) => ['tblWind_NRT_hourly','tblMITgcm_SWOT_2D'].some(s => s === tableName);

const { monthlyClimatology } = temporalResolutions;

class SpaceTimeData {
  constructor(payload) {
    this.parameters = payload.parameters;
    this.metadata = payload.metadata;

    this.hasDepth = null;
    this.isWind_NRT = false;
    this.isMonthly = null;

    this.depths = new Set();
    this.dates = new Set();
    this.variableValues = [];

    this.zMin = null;
    this.zMax = null;
    this.extent = [null, null];
    this.indexAdjust = null;
    this.payload = payload;
    this.lats = [];
    this.lons = [];

    this.lonMin = null;
    this.lonMax = null;
    this.latMin = null;
    this.latMax = null;

    this.distinctLatCount = null;
    this.distinctLonCount = null;
    this.rows = [];
  }

  add(row) {
    if (this.rows.length < 1) {
      console.log ('spacetimedata: variable parameters')
      console.table(this.parameters);
    }
    let lat = [row[1]]
      .map (parseFloat)
      // .map (roundToThousandths)
      .shift ();

    let lon = [row[2]]
      .map (parseFloat)
      .map (n => n < this.parameters.lon1 ? n + 360 : n)
      //.map (roundToThousandths)
      .shift ();

    let value = row.length === 5
              ? parseFloat(row[4])
              : parseFloat(row[3]);

    if (this.hasDepth === null) {
      this.isWind_NRT = this.metadata.Table_Name === 'tblWind_NRT_hourly';
      this.isMonthly =
        this.metadata.Temporal_Resolution === monthlyClimatology;
      // TODO: get hasDepth from catalog, don't infer it
      // this.hasDepth = row.length === 5 && !this.isWind_NRT;
      this.hasDepth = this.metadata.Has_Depth;
      this.indexAdjust = this.hasDepth ? 1 : 0;
      this.lonMin = lon;
      this.lonMax = lon;
      this.latMin = lat;
      this.latMax = lat;
    }

    // for tblWind_NRT_hourly
    // row[0] is a date string, and
    // row[3] is hour of the day (integer)
    let time = row[0];
    if (this.isWind_NRT && row.length > 4) {
      time = new Date(row[0]);
      time.setUTCHours(row[3]);
      time = time.toISOString();
    }

    this.dates.add(time);
    this.lats.push(lat);
    this.lons.push(lon);
    this.variableValues.push(value);
    if (this.hasDepth) {
      // if this data is coming from tblWind_NRT, row[3] is hour
      this.depths.add(parseFloat (row[3]));
    }

    if (lon < this.lonMin) this.lonMin = lon;
    if (lon > this.lonMax) this.lonMax = lon;
    if (lat < this.latMin) this.latMin = lat;
    if (lat > this.latMax) this.latMax = lat;

    let depth = this.hasDepth ? parseFloat(row[3]) : undefined;

    // NOTE this rows field normalizes depth at row[3],
    // whereas tblWind_NRT_hourly query result has hour at row[3]
    this.rows.push ([time, lat, lon, depth, value]);
  }

  finalize() {
    if (this.depths.size === 0) this.depths.add('Surface');

    this.lonCount = this.lons.length / this.dates.size / this.depths.size;
    this.latCount = this.lats.length / this.dates.size / this.depths.size;

    let quantile1 = quantile(this.variableValues, 0.05);
    let quantile2 = quantile(this.variableValues, 0.95);
    this.zMin =
      quantile1 === undefined ? null : parseFloat(quantile1.toPrecision(4));
    this.zMax =
      quantile2 === undefined ? null : parseFloat(quantile2.toPrecision(4));
    this.extent = extent(this.variableValues);

    // NOTE this assumes x & y are the same interval
    let spatialResolution = mapSpatialResolutionToNumber(
      this.metadata.Spatial_Resolution,
    );

    // QUESTION is the +1 working as expected with Math.round?
    this.distinctLatCount =
      Math.round((this.latMax - this.latMin) / spatialResolution) + 1;
    this.distinctLonCount =
      Math.round((this.lonMax - this.lonMin) / spatialResolution) + 1;
  }

  // Deprecated; use spaceTimeGenerateHistogramPlotData from myLib.js
  generatePlotData(subType, splitByDate, splitByDepth) {
    // Intervals are the number of indices between each change for that parameter
    // Intervals can change if you split out of order
    const latInterval = this.distinctLonCount;
    // QUESTION why is this called "depthInterval" when it is a combination of lat/lon ?
    const depthInterval = latInterval * this.distinctLatCount;
    // QUESTION why is this called dateInterval?
    const dateInterval = depthInterval * this.depths.size;

    // (end date - start date) / unique time values

    // difference between two adjacent time values (assumes uniformity)

    // an array of arrays containing variable values, each of which will become a chart
    var variableValueSubsets;

    variableValueSubsets = splitData(
      this.variableValues,
      dateInterval,
      this.dates.size,
    );
    variableValueSubsets = variableValueSubsets.map((subset) =>
      splitData(subset, depthInterval, this.depths.size),
    );
    variableValueSubsets = flattenArray(variableValueSubsets);

    // Contour and heatmap compute mean variable values per lat and lon
    // when not split by date and/or time
    if (subType === vizSubTypes.contourMap || subType === vizSubTypes.heatmap) {
      if (splitByDate && splitByDepth) {
        // pass
      } else if (splitByDate) {
        variableValueSubsets = mergeArraysAndComputeMeans(
          variableValueSubsets,
          1,
          this.depths.size,
          this.depths.size,
        );
      } else if (splitByDepth) {
        variableValueSubsets = mergeArraysAndComputeMeans(
          variableValueSubsets,
          this.depths.size,
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
    }

    // Histograms split and aggregate without computing means
    else if (subType === vizSubTypes.histogram) {
      if (splitByDate && splitByDepth) {
        // pass
      } else if (splitByDate) {
        variableValueSubsets = mergeArrays(
          variableValueSubsets,
          1,
          this.depths.size,
          this.depths.size,
        );
      } else if (splitByDepth) {
        variableValueSubsets = mergeArrays(
          variableValueSubsets,
          this.depths.size,
          1,
          this.dates.size,
        );
      } else {
        variableValueSubsets = [this.variableValues];
      }
    }

    // Nothing here yet
    else {
    }

    return variableValueSubsets;
  }

  generateCsv = () => {
    let dates = Array.from(this.dates);
    let depths = Array.from(this.depths);
    var csvArray;

    if (this.hasDepth) {
      csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

      for (let i = 0; i < this.variableValues.length; i++) {
        csvArray.push(
          `${
            dates[Math.floor(i / (this.variableValues.length / dates.length))]
          },${this.lats[i]},${
            this.lons[i] > 180 ? this.lons[i] - 360 : this.lons[i]
          },${
            depths[
              Math.floor(
                i /
                  (this.variableValues.length / (dates.length * depths.length)),
              ) % depths.length
            ]
          },${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`,
        );
      }
    } else {
      csvArray = [`time,lat,lon,${this.parameters.fields}`];

      for (let i = 0; i < this.variableValues.length; i++) {
        csvArray.push(
          `${
            dates[Math.floor(i / (this.variableValues.length / dates.length))]
          },${this.lats[i]},${
            this.lons[i] > 180 ? this.lons[i] - 360 : this.lons[i]
          },${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`,
        );
      }
    }

    return csvArray.join('\n');
  };
}

export default SpaceTimeData;
