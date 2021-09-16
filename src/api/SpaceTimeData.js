import { quantile, extent } from 'd3-array';

import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import flattenArray from '../Utility/flattenArray';
import splitData from '../Utility/splitData';
import mergeArraysAndComputeMeans from '../Utility/mergeArraysAndComputeMeans';
import mergeArrays from '../Utility/mergeArrays';

import vizSubTypes from '../enums/visualizationSubTypes';
import temporalResolutions from '../enums/temporalResolutions';

class SpaceTimeData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;

        this.hasDepth = null;
        this.hasHours = null;
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
    }

    add(row) {
        
        let lat = parseFloat(row[1]);
        let _lon = parseFloat(row[2]);
        let lon = _lon < this.parameters.lon1 ? _lon + 360 : _lon;

        if(this.hasDepth === null) {
            this.hasHour = this.metadata.Table_Name === 'tblWind_NRT';
            this.isMonthly = this.metadata.Temporal_Resolution === temporalResolutions.monthlyClimatology;
            this.hasDepth = row.length === 5 && !this.hasHour;
            this.indexAdjust = this.hasDepth || this.hasHour? 1 : 0;
            this.lonMin = lon;
            this.lonMax = lon;
            this.latMin = lat;
            this.latMax = lat;
        }

        let value = parseFloat(row[3 + this.indexAdjust]);

        if(this.hasDepth){
            this.depths.add(row[3]);
        }

        var time;
        if(this.hasHour){
            time = new Date(row[0]);
            time.setUTCHours(row[3])
            time = time.toISOString();
        } else time = row[0];
        this.dates.add(time);
        this.lats.push(lat);

        this.lons.push(lon);

        if(lon < this.lonMin) this.lonMin = lon;
        if(lon > this.lonMax) this.lonMax = lon;
        if(lat < this.latMin) this.latMin = lat;
        if(lat > this.latMax) this.latMax = lat;

        this.variableValues.push(value);
    }

    finalize() {

        if(this.depths.size === 0) this.depths.add('Surface');

        this.lonCount = this.lons.length / this.dates.size / this.depths.size;
        this.latCount = this.lats.length / this.dates.size / this.depths.size;

        let quantile1 = quantile(this.variableValues, .05);
        let quantile2 = quantile(this.variableValues, .95);
        this.zMin = quantile1 === undefined ? null : parseFloat(quantile1.toPrecision(4));
        this.zMax = quantile2 === undefined ? null : parseFloat(quantile2.toPrecision(4));
        this.extent = extent(this.variableValues);

        let spatialResolution = mapSpatialResolutionToNumber(this.metadata.Spatial_Resolution);
        
        this.distinctLatCount = Math.round((this.latMax - this.latMin) / spatialResolution) + 1;
        this.distinctLonCount = Math.round((this.lonMax - this.lonMin) / spatialResolution) + 1;
    }

    generatePlotData(subType, splitByDate, splitByDepth) {        

        // Intervals are the number of indices between each change for that parameter
        // Intervals can change if you split out of order
        const latInterval = this.distinctLonCount;
        const depthInterval = latInterval * this.distinctLatCount;
        const dateInterval = depthInterval * this.depths.size;

        // an array of arrays containing variable values, each of which will become a chart
        var variableValueSubsets;
        
        variableValueSubsets = splitData(this.variableValues, dateInterval, this.dates.size);
        variableValueSubsets = variableValueSubsets.map(subset => splitData(subset, depthInterval, this.depths.size));
        variableValueSubsets = flattenArray(variableValueSubsets);

        // Contour and heatmap compute mean variable values per lat and lon
        // when not split by date and/or time
        if(subType === vizSubTypes.contourMap || subType === vizSubTypes.heatmap) {
            if(splitByDate && splitByDepth) {
                // pass
            } else if (splitByDate){
                variableValueSubsets = mergeArraysAndComputeMeans(
                    variableValueSubsets, 
                    1, 
                    this.depths.size, 
                    this.depths.size
                    );
    
            } else if (splitByDepth){
                variableValueSubsets = mergeArraysAndComputeMeans(
                    variableValueSubsets, 
                    this.depths.size, 
                    1, 
                    this.dates.size
                    );
    
            } else {
                variableValueSubsets = mergeArraysAndComputeMeans(
                    variableValueSubsets, 
                    1, 
                    variableValueSubsets.length, 
                    variableValueSubsets.length
                    );            
            }
        } 
        
        // Histograms split and aggregate without computing means
        else if (subType === vizSubTypes.histogram) {
            if(splitByDate && splitByDepth) {
                // pass
            } else if (splitByDate){
                variableValueSubsets = mergeArrays(
                    variableValueSubsets, 
                    1,
                    this.depths.size,
                    this.depths.size
                    );
            } else if (splitByDepth){
                variableValueSubsets = mergeArrays(
                    variableValueSubsets,
                    this.depths.size,
                    1,
                    this.dates.size
                );
            } else {
                variableValueSubsets = [this.variableValues];
            }
        }

        // Nothing here yet
        else {}

        return variableValueSubsets;
    }

    generateCsv = () => {
        let dates = Array.from(this.dates);
        let depths = Array.from(this.depths);
        var csvArray;

        if(this.hasDepth){
            csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${dates[Math.floor(i / (this.variableValues.length / dates.length))]},${this.lats[i]},${this.lons[i] > 180 ? this.lons[i] - 360 : this.lons[i]},${depths[Math.floor(i / (this.variableValues.length / (dates.length * depths.length))) % depths.length]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }

        } else {
            csvArray = [`time,lat,lon,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${dates[Math.floor(i / (this.variableValues.length / dates.length))]},${this.lats[i]},${this.lons[i] > 180 ? this.lons[i] - 360 : this.lons[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }
        }

        return csvArray.join('\n');
    }
}

export default SpaceTimeData;