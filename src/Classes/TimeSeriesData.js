import mapSpatialResolutionToNumber from '../Utility/MapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/FlattenArray';
import splitData from '../Utility/SplitData';
import mergeArraysAndComputeMeans from '../Utility/MergeArraysAndComputeMeans';

class TimeSeriesData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.variableValues = [];
    }

    add(row) {

    }

    finalize() {

    }

    generatePlotData(splitByDate, splitByDepth) {

    }    
}

export default TimeSeriesData;