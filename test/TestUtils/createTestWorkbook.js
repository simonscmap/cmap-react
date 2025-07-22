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
const dataSheet = [
  [
    'time', 'lat', 'lon', 'sample_depth', 'Station', 'Date_sampled_local_time',
    'Time_sampled_local_time', 'Temp', 'Phosphate', 'Silicate'
  ],
  [
    '2021-08-18T19:25:00', 21.48290, -157.76630, 0.360, 'STO1', '2021-08-18',
    '09:25:00', 27.29, 0.11, 2.24
  ],
  [
    '2021-08-18T19:09:00+00:00', 21.43688, -157.80331, 0.352, 'HP1', '2021-08-18',
    '09:09:00', 27.57, 0.13, 15.63
  ],
  [
    40106.1930555556, 21.48290, -157.76630, 0.490, 'STO1', '2021-08-18',
    '10:49:00', 27.57, '', ''
  ],
  [
    '2021-08-18T20:31:00+05:00', 21.43688, -157.80331, 0.394, 'HP1', '2021-08-18',
    '10:31:00', 27.59, '', ''
  ]
];

// Create the data for the 'dataset_meta_data' sheet
const datasetMetaSheet = [
  [
    'dataset_short_name', 'dataset_long_name', 'dataset_version',
    'dataset_release_date', 'dataset_make', 'dataset_source',
    'dataset_distributor', 'dataset_acknowledgement', 'dataset_history',
    'dataset_description', 'dataset_references', 'climatology', 'cruise_names'
  ],
  [
    'HaDS_Diel_Multi_Omics', 'Diel Multi \'Omics From the Hawaii Diel Sampling Project',
    'v1.0', '2025-05-14', 'observation', 'Meren Lab, Helmholtz Institute for Functional Marine Biodiversity (HIFMB)',
    'Meren Lab, Helmholtz Institute for Functional Marine Biodiversity (HIFMB)',
    'The data collection and curation was supported by the Simons Foundation and the Simons Collaboration on Ocean Processes and Ecology.',
    'Processed Data, users may consider further quality control as needed.',
    'Here, we present data from the Hawaiʻi Diel Sampling Project...',
    'https://merenlab.org/data/hads/', 0.0, ''
  ],
  [
    '', '', '', '', '', '', '', '', '', '', 'Tucker SJ, Freel KC, Monaghan EA, Sullivan CES...', '', ''
  ]
];

// Create the data for the 'vars_meta_data' sheet
const varsMetaSheet = [
  [
    'var_short_name', 'var_long_name', 'var_sensor', 'var_unit',
    'var_spatial_res', 'var_temporal_res', 'var_discipline', 'visualize',
    'var_keywords', 'var_comment'
  ],
  [
    'sample_depth', 'Depth of sample collection', 'non-vented strain gauge', 'm',
    'Irregular', 'Irregular', 'Biogeochemistry', 1, 'observation, in-situ, North Pacific Ocean', ''
  ],
  [
    'Station', 'Station ID for Collection', 'uncategorized', 'unitless',
    'Irregular', 'Irregular', 'uncategorized', 0, 'observation, in-situ, North Pacific Ocean', 'yipieee'
  ],
  [
    'Date_sampled_local_time', 'Collection Date (Hawaii Standard Time)', 'uncategorized', 'MM/DD/YY',
    'Irregular', 'Irregular', 'uncategorized', 0, 'observation, in-situ, North Pacific Ocean', ''
  ],
  [
    'Time_sampled_local_time', 'Local time (Hawaii Standard Time)', 'uncategorized', 'hh:mm:ss AM/PM',
    'Irregular', 'Irregular', 'uncategorized', 0, 'observation, in-situ, North Pacific Ocean', ''
  ],
  [
    'Temp', 'Temperature In Situ', 'temperature sensor', 'degrees Celsius',
    'Irregular', 'Irregular', 'Biogeochemistry', 1, 'A. Murat Eren and the Simons Foundation to Sample Oceans', ''
  ],
  [
    'Phosphate', 'Inorganic Nutrients. Phosphate (PO43 –) Concentration', 'autoanalyzer', 'µM',
    'Irregular', 'Irregular', 'Biogeochemistry', 1, 'A. Murat Eren and the Simons Foundation to Sample Oceans', ''
  ],
  [
    'Silicate', 'Inorganic nutrients. Silicate (SiO4) Concentration', 'autoanalyzer', 'µM',
    'Irregular', 'Irregular', 'Biogeochemistry', 1, 'A. Murat Eren and the Simons Foundation to Sample Oceans', ''
  ]
];

const generateTestWorkbook = () => {
	const wb = XLSX.utils.book_new();
	const dataWs = XLSX.utils.aoa_to_sheet(dataSheet);
	XLSX.utils.book_append_sheet(wb, dataWs, 'data');

	const datasetMetaWs = XLSX.utils.aoa_to_sheet(datasetMetaSheet);
	XLSX.utils.book_append_sheet(wb, datasetMetaWs, 'dataset_meta_data');

	const varsMetaWs = XLSX.utils.aoa_to_sheet(varsMetaSheet);
	XLSX.utils.book_append_sheet(wb, varsMetaWs, 'vars_meta_data');
  return wb;
};

export default {
    standard,
    excelDate,
    alternateDateFormat,
    contains__EMPTYKeys,
    missingSheets,
    generateTestWorkbook
};