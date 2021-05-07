// Creates an object describing distinct values for each column
// Is run for each search result
// 

const buildSearchOptionsFromVariableList = (variables, storedOptions = {}, params = {}) => {
    console.log(variables);
    let options = {
        Sensor: new Set(),
        Temporal_Resolution: new Set(['Any']),
        Spatial_Resolution: new Set(['Any']),
        Data_Source: new Set(['Any']),
        Distributor: new Set(['Any']),
        Process_Level: new Set(['Any']),
        Make: new Set()
    };

    const columns = Object.keys(options);

    variables.forEach(v => {
        columns.forEach(k => {
            if(v[k]) options[k].add(v[k]);
        })
    })

    columns.forEach(col => {
        options[col] = Array.from(options[col]).sort(function (a, b) {
            try {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }

            catch (e){
                console.log(e);
            }
        });
    });

    if(params.sensor && params.sensor.size){
        options.Sensor = storedOptions.Sensor;
    }

    if(params.make && params.make.size){
        options.Make = storedOptions.Make
    }

    if(params.region && params.region.size){
        options.Region = storedOptions.Region
    }

    else {
        let regions = new Set();
        variables.forEach(v => {
            if(v.Regions){
                v.Regions.split(',').forEach(r => regions.add(r));
            }
        })

        options.Region = Array.from(regions).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }
    return options;
}

export default buildSearchOptionsFromVariableList;