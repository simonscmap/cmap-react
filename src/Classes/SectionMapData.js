import { quantile, extent } from 'd3-array';

import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/flattenArray';
import splitData from '../Utility/splitData';
import mergeArraysAndComputeMeans from '../Utility/mergeArraysAndComputeMeans';

class SectionMapData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        
        this.depths = new Set();
        this.dates = new Set();
        this.variableValues = [];
        
        this.lonStart = null;
        this.latStart = null;
        this.lonCount = null;
        this.latCount = null;
        
        this.zMin = null;
        this.zMax = null;
        this.extent = [null, null];

        this.orientation = null;
        
        this.latsDistinct = null;
        this.lonsDistinct = null;

        this.lats = null;
        this.lons = null;
        this.zonalPlotDepths = null;
        this.meridionalPlotDepths = null;
    }

    // time, lat, lon, depth, value
    add(row) {
        // Only on first row
        if(this.latStart === null) {
            this.latStart = parseFloat(row[1]);
            this.lonStart = parseFloat(row[2]);
        }

        this.depths.add(row[3]);
        this.dates.add(row[0]);

        this.variableValues.push(parseFloat(row[4]));
    }

    finalize() {
        const spatialResolution = mapSpatialResolutionToNumber(this.metadata.Spatial_Resolution);

        // Simple arrays of lats and lons
        let lonsList = generateSpatialArray(this.lonStart, spatialResolution, this.parameters.lon2);
        let latsList = generateSpatialArray(this.latStart, spatialResolution, this.parameters.lat2);

        this.lonCount = lonsList.length;
        this.latCount = latsList.length;

        this.lonsDistinct = lonsList;
        this.latsDistinct = latsList;

        let quantile1 = quantile(this.variableValues, .05);
        let quantile2 = quantile(this.variableValues, .95);
        this.zMin = quantile1 === undefined ? null : quantile1.toPrecision(4);
        this.zMax = quantile2 === undefined ? null : quantile2.toPrecision(4);

        this.extent = extent(this.variableValues);

        // Expanded arrays to be used in plots
        let lats = [];
        let lons = []

        for(let i = 0; i < latsList.length; i ++){
            for(let j = 0; j < this.depths.size; j++){
                lats.push(latsList[i]);
            }
        }

        for(let i = 0; i < lonsList.length; i ++){
            for(let j = 0; j < this.depths.size; j++){
                lons.push(lonsList[i]);
            }
        }

        this.lats = lats;
        this.lons = lons;

        let zonalPlotDepths = [];
        let meridionalPlotDepths = [];
        let depthsList = Array.from(this.depths).map(depth => parseFloat(depth));

        for(let i = 0; i < this.latsDistinct.length; i++){
            for(let j = depthsList.length - 1; j > -1; j--){
                meridionalPlotDepths.push(depthsList[j]);
            }
        }

        for(let i = 0; i < this.lonsDistinct.length; i++){
            for(let j = depthsList.length - 1; j > -1; j--){
                zonalPlotDepths.push(depthsList[j]);
            }
        }

        this.zonalPlotDepths = zonalPlotDepths;
        this.meridionalPlotDepths = meridionalPlotDepths;
        
        this.orientation = this.lonCount > this.latCount ? 'zonal' : 'meridional';
    }

    // Direction is meridional or zonal
    generatePlotData(orientation, splitByDate, splitBySpace) {

        // Intervals are the number of indices between each change for that parameter
        // Intervals can change if you split out of order
        const lonInterval = this.depths.size;
        const latInterval = lonInterval * this.lonCount;
        const dateInterval = latInterval * this.latCount;

        // // an array of arrays containing variable values, each of which will become a chart
        var variableValueSubsets;
        
        variableValueSubsets = splitData(this.variableValues, dateInterval, this.dates.size);

        // either latCount or lonCount depending on orientation
        let spaceCount;

        if(orientation === 'zonal') {
            variableValueSubsets = variableValueSubsets.map(subset => splitData(subset, latInterval, this.latCount));
            variableValueSubsets = flattenArray(variableValueSubsets);
            spaceCount = this.latCount;
        }

        else {
            variableValueSubsets = variableValueSubsets.map(subset => splitData(subset, lonInterval, this.lonCount));
            variableValueSubsets = flattenArray(variableValueSubsets);
            spaceCount = this.lonCount;
        }

        if(splitByDate && splitBySpace){
            // pass
        } else if (splitByDate){
            variableValueSubsets = mergeArraysAndComputeMeans(
                variableValueSubsets,
                1,
                spaceCount,
                spaceCount
            )
        } else if (splitBySpace) {
            variableValueSubsets = mergeArraysAndComputeMeans(
                variableValueSubsets,
                spaceCount,
                1,
                this.dates.size
            )
        } else {
            variableValueSubsets = mergeArraysAndComputeMeans(
                variableValueSubsets,
                1,
                variableValueSubsets.length,
                variableValueSubsets.length
            )
        }

        return variableValueSubsets;
    }

    generateCsv = () => {
        let dates = Array.from(this.dates);
        let depths = Array.from(this.depths);

        var csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

        for(let i = 0; i < this.variableValues.length; i++){
            csvArray.push(`${dates[Math.floor(i / (this.variableValues.length / dates.length))]},${this.lats[i]},${this.lons[i]},${depths[i % depths.length]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
        }

        return csvArray.join('\n');
    }
}

export default SectionMapData;