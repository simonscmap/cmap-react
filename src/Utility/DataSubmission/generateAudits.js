export default (submissionOptions) => {
    const { Make, Sensor, Spatial_Resolution, Study_Domain, Temporal_Resolution } = submissionOptions;
    
    const number = (value) => {
        if(!value && value !== 0) return null;
        if(isNaN(value) || isNaN(parseInt(value))) return 'Must be a number';
    }
    
    const validLat = (value) => {
        if(value < -90 || value > 90) return 'Must be -90 to 90';
    }
    
    const validLon = (value) => {
        if(value < -180 || value > 180) return 'Must be -180 to 180';
    }
    
    const validTime = (value) => {
        if(!value && value !== 0) return null;
    
    
        if(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\\.[0-9]+)?(Z)?$/.test(value) === false){
            return 'Format must match 2016-04-21T15:22:00'
        }    
    }

    const required = (value) => {
        if(value === null || value === undefined || value === '') return 'Value is required';
    }

    const datasetRequired = (value, row) => {
        if(row !== 0) return;
        if(value === null || value === undefined || value === '') return 'Value is required';
    }
    
    const length = (min, max) => {
        return (value) => {
            value = value + '';
            if(value.length < min || value.length > max) {
                return `Must be ${min} to ${max} characters in length`;
            }
        }
    }

    const datasetLength = (min, max) => {
        return (value, row) => {
            value = value + '';
            if((value.length < min && row === 0) || (value.length > max && row === 0)) {
                return `Must be ${min} to ${max} characters in length`;
            }
        }
    }
    
    const positive = (value) => {
        if(value < 0) return 'Cannot be negative';
    }
    
    const makes = Make.map(e => e.toLowerCase());
    const makesSet = new Set(makes);
    
    const validMake = (value, row) => {
        if(row !== 0) return;
        if(!value || !makesSet.has(value.toLowerCase())) {
            return `Must be one of the above options.`;
        }
    }
    
    const disciplines = Study_Domain.map(e => e.toLowerCase());
    const disciplinesSet = new Set(disciplines);
    
    const validDiscipline = (value) => {
        if(!value || !disciplinesSet.has(value.toLowerCase())) {
            return `Must be one of the above options.`;
        }
    }
    
    const sensors = Sensor.map(e => e.toLowerCase());
    const sensorsSet = new Set(sensors);
    
    const validSensor = (value) => {
        if(!value || !sensorsSet.has(value.toLowerCase())) {
            return `Must be one of the above options.`;
        }
    }
    
    const codeFriendly = (value) => {
        if(!(/^[a-zA-Z]{1}[a-zA-Z0-9_]*$/.test(value))){
            return 'Must start with a letter and contain only letters, numbers, and underscores.'
        }
    }
    
    const binary = (value) => {
        if(!value || value == 1 || value == 0){
            return;
        }
    
        else {
            return 'Must be 0, 1, or empty.';
        }
    }
    
    // const validEmail = (value, row) => {
    //     if(!value) return;
    //     if(row > 0) return;
    //     if(!(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(value))){
    //         return 'Must be a valid email address'
    //     }
    // }
    
    const spatialResolutions = Spatial_Resolution.map(e => e.toLowerCase());
    const spatialResolutionSet = new Set(spatialResolutions);
    const validSpatialResolution = (value) => {
        if(!value || !spatialResolutionSet.has(value.toLowerCase())) {
            return `Must be one of the above options.`;
        }
    }
    
    const temporalResolutions = Temporal_Resolution.map(e => e.toLowerCase());
    const temporalResolutionsSet = new Set(temporalResolutions);
    const validTemporalResolution = (value) => {
        if(!value || !temporalResolutionsSet.has(value.toLowerCase())) {
            return `Must be one of the above options.`;
        }
    }
    
    const maxDepth = (value) => {
        if(value > 11000) {
            return 'Cannot be greater than 11000';
        }
    }
    
    const releaseDate = (value, row) => {
        if(row !== 0) return;
        if(!(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(value))){
            return 'Format must match 2018-06-20'
        }
    }

    const firstRowOnly = (value, row) => {
        if((value || value === 0) && row > 0){
            return 'Value only allowed in first row of sheet'
        }
    }
    
    return {
        time: [required, validTime],
        lat: [number, required, validLat],
        lon: [number, required, validLon],
        depth: [number, positive, maxDepth],
    
        dataset_short_name: [datasetRequired, codeFriendly, datasetLength(1, 50), firstRowOnly],
        dataset_long_name: [datasetRequired, datasetLength(1, 200), firstRowOnly],
        dataset_version: [length(0, 50), firstRowOnly],
        dataset_release_date: [releaseDate, firstRowOnly],
        dataset_make: [datasetRequired, validMake, firstRowOnly],
        dataset_source: [datasetRequired, datasetLength(1, 100), firstRowOnly],
        dataset_distributor: [length(0, 100), firstRowOnly],
        dataset_acknowledgement: [datasetRequired, datasetLength(1, 10000)],
        dataset_history: [length(0, 500), firstRowOnly],
        dataset_description: [datasetRequired, datasetLength(50, 10000), firstRowOnly],
        dataset_references: [datasetRequired, datasetLength(1, 500)],
        climatology: [binary, firstRowOnly],
        // contact_email: [validEmail, firstRowOnly],
        cruise_names: [datasetLength(0, 200)],
        
        var_short_name: [required, codeFriendly, length(1, 50)],
        var_long_name: [required, length(1, 200)],
        var_sensor: [required, validSensor],
        var_unit: [length(0, 50)],
        var_spatial_res: [required, validSpatialResolution],
        var_temporal_res: [required, validTemporalResolution],
        var_discipline: [validDiscipline],
        visualize: [binary],
        var_keywords: [],
        var_comment: []
    }
}



// match data column names to data_metadata
// there should be at least 1 additional column 
// check resolutions against time and lat/lon increments
// keyword validation