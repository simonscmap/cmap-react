import mapSpatialResolutionToNumber from '../Utility/MapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/FlattenArray';
import splitData from '../Utility/SplitData';
import mergeArraysAndComputeMeans from '../Utility/MergeArraysAndComputeMeans';

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

        // Arrays of lons and lats
        this.lons = generateSpatialArray(this.lonStart, spatialResolution, this.parameters.lon2);
        this.lats = generateSpatialArray(this.latStart, spatialResolution, this.parameters.lat2);
    }

    generatePlotData(splitByDate, splitByDepth) {
        if(this.depths.size === 0) this.depths.add('Surface');

        // Intervals are the number of indices between each change for that parameter
        // Intervals can change if you split out of order
        const lonInterval = 1;
        const latInterval = this.lons.length;
        const depthInterval = latInterval * this.lats.length;
        const dateInterval = depthInterval * this.depths.size;

        // an array of arrays containing variable values, each of which will become a chart
        var variableValueSubsets;
        
        variableValueSubsets = splitData(this.variableValues, dateInterval, this.dates.size);
        variableValueSubsets = variableValueSubsets.map(subset => splitData(subset, depthInterval, this.depths.size))
        variableValueSubsets = flattenArray(variableValueSubsets);

        // data, 
        // mergeTargetDistance, 
        // nextMergeStartDistance, 
        // numArraysPerMerge, 

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

        return variableValueSubsets;
    }    
}

export default SpaceTimeData;