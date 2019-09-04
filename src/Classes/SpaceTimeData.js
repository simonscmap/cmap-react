import mapSpatialResolutionToNumber from '../Utility/MapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/FlattenArray';
import splitData from '../Utility/SplitData';
import mergeArraysAndComputeMeans from '../Utility/MergeArraysAndComputeMeans';
import mergeArrays from '../Utility/MergeArrays';

import vizSubTypes from '../Enums/visualizationSubTypes';

class SpaceTimeData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.hasDepth = null;
        this.depths = new Set();
        this.dates = new Set();
        this.variableValues = [];
        this.lonStart = null;
        this.latStart = null;
        this.lonCount = null;
        this.latCount = null;
    }

    add(row) {
        // Only on first row
        if(this.hasDepth === null) {
            this.hasDepth = Boolean(row.depth);
            this.lonStart = row.lon;
            this.latStart = row.lat;
        }

        if(this.hasDepth){
            this.depths.add(row.depth);
        }

        this.dates.add(row.time);

        this.variableValues.push(row[this.parameters.fields])
    }

    finalize() {
        const spatialResolution = mapSpatialResolutionToNumber(this.metadata.spatialResolution);

        // Simple arrays of lats and lons
        let lonsList = generateSpatialArray(this.lonStart, spatialResolution, this.parameters.lon2);
        let latsList = generateSpatialArray(this.latStart, spatialResolution, this.parameters.lat2);

        this.lonCount = lonsList.length;
        this.latCount = latsList.length;

        // Expanded arrays to be used in plots
        let lats = [];
        let lons = []

        for(let i = 0; i < latsList.length; i ++){
            for(let j = 0; j < lonsList.length; j++){
                lats.push(latsList[i]);
                lons.push(lonsList[j]);
            }
        }

        this.lats = lats;
        this.lons = lons;
    }

    generatePlotData(subType, splitByDate, splitByDepth) {
        if(this.depths.size === 0) this.depths.add('Surface');

        // Intervals are the number of indices between each change for that parameter
        // Intervals can change if you split out of order
        const lonInterval = 1;
        const latInterval = this.lonCount;
        const depthInterval = latInterval * this.latCount;
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

        console.log(variableValueSubsets);
        return variableValueSubsets;
    }    
}

export default SpaceTimeData;