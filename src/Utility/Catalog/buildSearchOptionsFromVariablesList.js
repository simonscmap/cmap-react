const buildSearchOptionsFromVariableList = (variables) => {
    let options = {
        Sensor: new Set(['Any']),
        Temporal_Resolution: new Set(['Any']),
        Spatial_Resolution: new Set(['Any']),
        Data_Source: new Set(['Any']),
        Distributor: new Set(['Any']),
        Process_Level: new Set(['Any'])
    };

    const keys = Object.keys(options);

    variables.forEach(v => {
        keys.forEach(k => {
            options[k].add(v[k]);
        })
    })

    Object.keys(options).forEach(cat => {
        options[cat] = Array.from(options[cat]);
    });

    return options;
}

export default buildSearchOptionsFromVariableList;