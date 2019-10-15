import { quantile, extent } from 'd3-array';

class SparseData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.hasDepth = Boolean(payload.metadata.Depth_Min);
        this.variableIndex = payload.metadata.Depth_Min ? 4 : 3;
        this.depths = [];
        this.times = [];
        this.variableValues = [];
        this.lats = [];
        this.lons = [];
        this.zMin = null;
        this.zMax = null;
        this.extent = [null, null];
    }

    add(row) {
        if(row[this.variableIndex]){
            this.times.push(row[0]);
            this.lats.push(parseFloat(row[1]));
            this.lons.push(parseFloat(row[2]));
            if(this.hasDepth) this.depths.push(parseFloat(row[3]));
            this.variableValues.push(parseFloat(row[this.variableIndex]));
        }
    }

    finalize() {

        let quantile1 = quantile(this.variableValues, .05);
        let quantile2 = quantile(this.variableValues, .95);
        this.zMin = quantile1 === undefined ? null : quantile1.toPrecision(4);
        this.zMax = quantile2 === undefined ? null : quantile2.toPrecision(4);

        this.extent = extent(this.variableValues);
    }

    generatePlotData(subType, splitByDate, splitByDepth) {
        return this.variableValues;
    }

    generateCsv(){

        if(this.hasDepth){
            var csvArray = [`time,lat,lon,depth,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${this.times[i]},${this.lats[i]},${this.lons[i]},${this.depths[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }

        } else {
            var csvArray = [`time,lat,lon,${this.parameters.fields}`];

            for(let i = 0; i < this.variableValues.length; i++){
                csvArray.push(`${this.times[i]},${this.lats[i]},${this.lons[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]}`);
            }
        }

        return csvArray.join('\n');
    }
}

export default SparseData;