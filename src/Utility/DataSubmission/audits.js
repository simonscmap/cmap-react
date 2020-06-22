const number = (value) => {
    if(!value && value !== 0) return null;
    if(isNaN(value) || value === '') return 'Must be a number';
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

const length = (min, max) => {
    return (value) => {
        if(value < min || value > max) {
            return `Must be ${min} to ${max} characters in length`;
        }
    }
}

const positive = (value) => {
    if(value < 0) return 'Cannot be negative';
}

const _makes = ['Observation', 'Model', 'Assimilation'];
const makes = _makes.map(e => e.toLowerCase());
const makesString = makes.join('\n');
const makesSet = new Set(makes);

const validMake = (value) => {
    if(value && value !== 0 && !makesSet.has(value.toLowerCase())) {
        return `Make must be one of: \n${makesString}`;
    }
}

const _disciplines = ['Physics', 'Chemistry', 'Biology', 'Biogeochemistry', 'Physics+Biogeochemistry', 'Chemistry+Biology+Biogeochemistry', 'Biosample', 'Biology+BioGeoChemistry+Biogeography', 'Physics+Chemistry', 'Genomics', 'Chemistry+Biogeochemistry'];
const disciplines = _disciplines.map(e => e.toLowerCase());
const disciplinesSet = new Set(disciplines);

const validDiscipline = (value) => {
    if(value && value !== 0 && !disciplinesSet.has(value.toLowerCase())) {
        return `Must be one of: \n${disciplines.join('\n')}`;
    }
}

const _sensors = ['Satellite', 'In-Situ', 'Blend', 'Flow Cytometry', 'CTD', 'Underway CTD', 'Optical', 'Float', 'Drifter', 'AUV', 'Bottle', 'Sediment Trap', 'CPR', 'Towfish', 'fluorometer', 'Seaglider'];
const sensors = _sensors.map(e => e.toLowerCase());
const sensorsSet = new Set(sensors);

const validSensor = (value) => {
    if(value && value !== 0 && !sensorsSet.has(value.toLowerCase())) {
        return `Must be one of: \n${sensors.join('\n')}`;
    }
}

const codeFriendly = (value) => {
    // TODO identify regex for this
}

const binary = (value) => {
    if(!value || value === 1){
        return;
    }

    else {
        return 'Must be 0, 1, or empty.';
    }
}

const validEmail = (value) => {
    if(!(/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(value))){
        return 'Must be a valid email address'
    }
}

const _spatialResolutions = [
    'Irregular',
    '1/2° X 1/2°',
    '1/4° X 1/4°',
    '1/25° X 1/25°',
    '4km X 4km',
    '1/12° X 1/12°',
    '70km X 70km',
    '1° X 1°',
    '9km X 9km',
    '25km X 25km'
];

const spatialResolutions = _spatialResolutions.map(e => e.toLowerCase());
const spatialResolutionSet = new Set(spatialResolutions);
const validSpatialResolution = (value) => {
    if(value && value !== 0 && !spatialResolutionSet.has(value.toLowerCase())) {
        return `Must be one of: \n${spatialResolutions.join('\n')}`;
    }
}

const _temporalResolutions = [
    'Three Minutes',
    'Six Hourly',
    'Daily',
    'Weekly',
    'Monthly',
    'Annual',
    'Irregular',
    'Monthly Climatology',
    'Three Days',
    'Eight Day Running',
    'Eight Days',
    'One Second'
];

const temporalResolutions = _temporalResolutions.map(e => e.toLowerCase());
const temporalResolutionsSet = new Set(temporalResolutions);
const validTemporalResolution = (value) => {
    if(value && value !== 0 && !temporalResolutionsSet.has(value.toLowerCase())) {
        return `Must be one of: \n${temporalResolutions.join('\n')}`;
    }
}

const maxDepth = (value) => {
    if(value > 11000) {
        return 'Cannot be greater than 11000';
    }
}

const releaseDate = (value) => {
    if(!(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(value))){
        return 'Format must match 2018-06-20'
    }
}

export default {
    time: [required, validTime],
    lat: [number, required, validLat],
    lon: [number, required, validLon],
    depth: [number, positive, maxDepth],

    dataset_short_name: [codeFriendly, length(1, 50)],
    dataset_long_name: [length(1, 130)],
    dataset_version: [length(0, 50)],
    dataset_release_date: [releaseDate],
    dataset_make: [required, validMake],
    dataset_source: [length(1, 50)],
    dataset_distributor: [length(0, 100)],
    dataset_acknowledgement: [length(1, 300)],
    dataset_history: [length(0, 500)],
    dataset_description: [length(50, 10000)],
    dataset_references: [length(1, 500)],
    climatology: [binary],
    contact_email: [validEmail],
    'official_cruise_name(s)': [],

    var_short_name: [codeFriendly, length(1, 50)],
    var_long_name: [length(1, 200)],
    var_sensor: [required, validSensor],
    var_unit: [required],
    var_spatial_res: [required, validSpatialResolution],
    var_temporal_res: [required, validTemporalResolution],
    var_discipline: [required, validDiscipline],
    visualize: [binary],
    var_keywords: []
}


// match data column names to data_metadata
// there should be at least 1 additional column 
// check resolutions against time and lat/lon increments
// keyword validation
