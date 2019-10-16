import { quantile, extent } from 'd3-array';

import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import generateSpatialArray from '../Utility/GenerateSpatialArray';
import flattenArray from '../Utility/flattenArray';
import splitData from '../Utility/splitData';
import mergeArraysAndComputeMeans from '../Utility/mergeArraysAndComputeMeans';
import mergeArrays from '../Utility/mergeArrays';

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
        this.zMin = null;
        this.zMax = null;
        this.extent = [null, null];
        this.depthIndexAdjust = null;
        this.next = null;
    }

    add(row) {
        // Only on first row
        if(this.hasDepth === null) {
            this.hasDepth = row.length === 5;
            this.lonStart = parseFloat(row[2]);
            this.latStart = parseFloat(row[1]);
            this.depthIndexAdjust = this.hasDepth ? 1 : 0;
        }

        if(this.hasDepth){
            this.depths.add(row[3]);
        }

        this.dates.add(row[0]);

        this.variableValues.push(parseFloat(row[3 + this.depthIndexAdjust]));
    }

    finalize() {
        const spatialResolution = mapSpatialResolutionToNumber(this.metadata.Spatial_Resolution);

        // Simple arrays of lats and lons
        let lonsList = generateSpatialArray(this.lonStart, spatialResolution, this.parameters.lon2);
        let latsList = generateSpatialArray(this.latStart, spatialResolution, this.parameters.lat2);

        this.lonCount = lonsList.length;
        this.latCount = latsList.length;

        let quantile1 = quantile(this.variableValues, .05);
        let quantile2 = quantile(this.variableValues, .95);
        this.zMin = quantile1 === undefined ? null : quantile1.toPrecision(4);
        this.zMax = quantile2 === undefined ? null : quantile2.toPrecision(4);
        this.extent = extent(this.variableValues);

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

        return variableValueSubsets;
    }

    generateCsv = () => {
        let dates = Array.from(this.dates);
        let depths = Array.from(this.depths);

        if(this.hasDepth){
            var csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${dates[Math.floor(i / (this.variableValues.length / dates.length))]},${this.lats[i]},${this.lons[i]},${depths[Math.floor(i / (this.variableValues.length / (dates.length * depths.length))) % depths.length]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }

        } else {
            var csvArray = [`time,lat,lon,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${dates[Math.floor(i / (this.variableValues.length / dates.length))]},${this.lats[i]},${this.lons[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }
        }

        return csvArray.join('\n');
    }
}

export default SpaceTimeData;