import temporalResolutions from '../Enums/temporalResolutions';

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
            this.hasHour = this.metadata.Table_Name === 'tblWind_NRT';
            this.isMonthly = this.metadata.Temporal_Resolution === temporalResolutions.monthlyClimatology;
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

    generateCsv() {
        let csvString = `time,${this.parameters.fields},${this.parameters.fields}_std`;

        for(let i = 0; i < this.variableValues.length; i++){
            csvString += `\n${this.dates[i]},${isNaN(this.variableValues[i]) ? '' : this.variableValues[i]},${isNaN(this.stds[i]) ? '' : this.stds[i]}`;
        }

        return csvString;
    }
}

export default TimeSeriesData;