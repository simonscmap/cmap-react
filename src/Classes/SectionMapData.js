import { quantile } from 'd3-array';

import mapSpatialResolutionToNumber from '../Utility/MapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/FlattenArray';
import splitData from '../Utility/SplitData';
import mergeArraysAndComputeMeans from '../Utility/MergeArraysAndComputeMeans';
import mergeArrays from '../Utility/MergeArrays';

import vizSubTypes from '../Enums/visualizationSubTypes';


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
        this.orientation = null;
        this.latsDistinct = null;
        this.lonsDistinct = null;

        this.plotLats = null;
        this.plotLons = null;
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

        console.log('Calculating quantiles');
        let start = new Date();
        this.zMin = quantile(this.variableValues, .08);
        console.log(new Date() - start);
        start = new Date();
        this.zMax = quantile(this.variableValues, .92);
        console.log(new Date() - start);

        // Expanded arrays to be used in plots
        let lats = [];
        let lons = []

        console.log('Generating spatial arrays');
        start = new Date();

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

        this.plotLats = lats;
        this.plotLons = lons;

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
        console.log(new Date() - start);
    }

    // Direction is meridional or zonal
    generatePlotData(orientation, splitByDate, splitBySpace) {

        // Intervals are the number of indices between each change for that parameter
        // Intervals can change if you split out of order
        const depthInterval = 1;
        const lonInterval = this.depths.size;
        const latInterval = lonInterval * this.lonCount;
        const dateInterval = latInterval * this.latCount;

        // // an array of arrays containing variable values, each of which will become a chart
        var variableValueSubsets;
        
        variableValueSubsets = splitData(this.variableValues, dateInterval, this.dates.size);

        // either latCount or lonCount depending on orientation
        let spaceCount;

        if(orientation == 'zonal') {
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
}

export default SectionMapData;