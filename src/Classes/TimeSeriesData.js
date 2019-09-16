class TimeSeriesData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.variableValues = [];
        this.stds = [];
        this.dates = [];
        this.lat = null;
        this.lon = null;
        this.depth = null;
        this.depthIndexAdjust = null;
    }

    add(row) {
        if(this.lat === null){
            this.depthIndexAdjust = row.length === 6 ? 1 : 0;
            this.lat = row[1];
            this.lon = row[2];
            this.depth = row.length === 6 ? row[3] : false;
        }

        this.variableValues.push(row[3 + this.depthIndexAdjust]);
        this.stds.push(row[4 + this.depthIndexAdjust]);
        this.dates.push(row[0]);
    }

    finalize() {
        if(this.depth === false) this.depth = 'Surface';
    }

    generatePlotData() {
        return this.variableValues;
    }    
}

export default TimeSeriesData;