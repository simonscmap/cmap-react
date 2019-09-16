class DepthProfileData {
    constructor(payload) {
        this.parameters = payload.parameters;
        this.metadata = payload.metadata;
        this.variableValues = [];
        this.stds = [];
        this.lat = null;
        this.lon = null;
        this.depths = [];
    }

    add(row) {
        if(this.lat === null){
            this.lat = parseFloat(row[0]);
            this.lon = parseFloat(row[1]);
        }

        this.variableValues.push(parseFloat(row[2]));
        this.stds.push(parseFloat(row[3]));
        this.depths.push(parseFloat(row[4]));
    }

    finalize() {
        // pass
    }

    generatePlotData() {
        return this.variableValues;
    }    
}

export default DepthProfileData;