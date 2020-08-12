import XLSX from 'xlsx';

let test_dataset_meta_data = [{
    dataset_short_name: 'Test',
    dataset_long_name: 'Standard workbook test',
    dataset_version: 1,
    dataset_release_date:'03/10/2020',
    dataset_make: 'observation',
    dataset_source: 'Da ocean',
    dataset_distributor: 'UW',
    dataset_acknowledgement: 'Armbrust lab',
    dataset_history: 'A long time ago in an ocean far far away',
    dataset_description: "There's something about prochlorococcus",
    dataset_references: 'Wikipedia',
    climatology: 0,
    cruise_names: 'HOT'
}];

let test_vars_meta_data = [{
    var_short_name: 'var1',
    var_long_name: 'Variable 1',
    var_sensor: 'flow cytometry',
    var_unit: 'degrees celsius',
    var_spatial_res: 'irregular',
    var_temporal_res: 'irregular',
    var_discipline: 'BioGeoChemistry',
    visualize: 1,
    var_keywords: 'pro, seaflow, var1'        
},

{
    var_short_name: 'var2',
    var_long_name: 'Variable 2',
    var_sensor: 'flow cytometry',
    var_unit: 'degrees celsius',
    var_spatial_res: 'irregular',
    var_temporal_res: 'irregular',
    var_discipline: 'BioGeoChemistry',
    visualize: 1,
    var_keywords: 'pro, seaflow, var1'        
}];

let test_data = [{
    time: new Date().toISOString(),
    lat: 10,
    lon: 10,
    depth: 10,
    var1: 10,
    var2: 10
}];

let standard = () => {
    let workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(test_data), 'data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(test_dataset_meta_data), 'dataset_meta_data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(test_vars_meta_data), 'vars_meta_data');

    return workbook;
}

let missingSheets = () => {
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(test_data), 'data');
    return workbook;
}

let excelDate = () => {
    let workbook = XLSX.utils.book_new();
    let data = [{
        time: 25500,
        lat: 10,
        lon: 10,
        depth: 10,
        var1: 10,
        var2: 10
    }];

    let dataset_meta_data = [{
        dataset_release_date: 25500,
    }];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dataset_meta_data), 'dataset_meta_data');
    return workbook;
}

let alternateDateFormat = () => {
    let workbook = XLSX.utils.book_new();
    let data = [{
        time: '1/1/20',
    }];
    let dataset_meta_data = [{
        dataset_release_date: new Date().toISOString(),
    }];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), 'data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dataset_meta_data), 'dataset_meta_data');
    return workbook;
}

let contains__EMPTYKeys = () => {
    // The library removes __EMTPY keys silently so this didn't work....
    let workbook = XLSX.utils.book_new();

    let variable_meta_data = [{
        var_short_name: 'var1',
        var_long_name: 'Variable 1',
        var_sensor: 'flow cytometry',
        var_unit: 'degrees celsius',
        var_spatial_res: 'irregular',
        var_temporal_res: 'irregular',
        var_discipline: 'BioGeoChemistry',
        visualize: 1,
        var_keywords: 'pro, seaflow, var1'
    }];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(variable_meta_data), 'variable_meta_data');
    return workbook;
};

export default {
    standard,
    excelDate,
    alternateDateFormat,
    contains__EMPTYKeys,
    missingSheets
};