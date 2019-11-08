import { quantile, extent } from 'd3-array';

class SparseData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.hasDepth = null;
        this.variableIndex = payload.metadata.Depth_Min ? 4 : 3;
        this.depths = [];
        this.times = [];
        this.variableValues = [];
        this.lats = [];
        this.lons = [];
        this.zMin = null;
        this.zMax = null;
        this.extent = [null, null];

        this.latMin = null;
        this.latMax = null;
        this.lonMin = null;
        this.lonMax = null;
    }

    add(row) {
        let lat = parseFloat(row[1]);
        let lon = parseFloat(row[2]);

        if(this.hasDepth === null){
            this.hasDepth = Boolean(this.metadata.Depth_Min);
            this.latMin = lat;
            this.latMax = lat;
            this.lonMin = lon;
            this.lonMax = lon;
        }

        if(row[this.variableIndex]){

            this.times.push(row[0]);
            this.lats.push(lat);
            this.lons.push(lon);
            if(this.hasDepth) this.depths.push(parseFloat(row[3]));
            this.variableValues.push(parseFloat(row[this.variableIndex]));

            if(lat < this.latMin) this.latMin = lat;
            if(lat > this.latMax) this.latMax = lat;
            
            if(lon < this.lonMin) this.lonMin = lon;
            if(lon > this.lonMax) this.lonMax = lon;
        }
    }

    finalize() {

        let quantile1 = quantile(this.variableValues, .05);
        let quantile2 = quantile(this.variableValues, .95);
        this.zMin = quantile1 === undefined ? null : quantile1.toPrecision(4);
        this.zMax = quantile2 === undefined ? null : quantile2.toPrecision(4);

        this.extent = extent(this.variableValues);

        let latDistance = Math.abs(this.latMax - this.latMin);
        let lonDistance = Math.abs(this.lonMax - this.lonMin);
        let distance = Math.sqrt(latDistance * latDistance + lonDistance * lonDistance);

        console.log('Distance: ', distance);

        let _zoom = 4 - Math.floor(distance / 12);
        this.zoom = _zoom < 0 ? 0 : _zoom;

        let lonCenter = (this.lonMax + this.lonMin) / 2;
        let latCenter = (this.latMax + this.latMin) / 2;
        this.center = { 
            lon: lonCenter, 
            lat: latCenter
        }

        console.log(this);
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