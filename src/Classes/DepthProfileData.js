import temporalResolutions from '../Enums/temporalResolutions';

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
            this.isMonthly = this.metadata.Temporal_Resolution === temporalResolutions.monthlyClimatology;
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
    
    generateCsv() {
        let csvString = `depth,${this.parameters.fields},${this.parameters.fields}_std`;

        for(let i = 0; i < this.variableValues.length; i++){
            csvString += `\n${this.depths[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]},${isNaN(this.stds[i]) ? '' : this.stds[i]}`;
        }

        return csvString;
    }
}

export default DepthProfileData;