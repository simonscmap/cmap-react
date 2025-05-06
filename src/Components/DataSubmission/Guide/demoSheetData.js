// first 10 rows of sample data dataset
const data = [
  ['1995-09-24T17:00:00', 50.1569, -3.59969, 6, 1, 10.36, 3, 19.08, 3],
  ['1995-09-24T19:00:00', 49.9989, -4.15888, 6, 2, 1.81, 1, 2.66, 1],
  ['1995-09-24T21:00:00', 49.8287, -4.77281, 6, 3, 0.58, 1, 0.97, 1],
  ['1995-09-24T23:00:00', 49.6068, -5.40641, 6, 4, 2.29, 1, 3.17, 1],
  ['1995-09-25T01:09:00', 49.4447, -6.09408, 6, 5, 0.51, 1, 0.67, 1],
  ['1995-09-25T03:16:00', 49.3529, -6.73043, 6, 6, 3.06, 1, 4.73, 1],
  ['1995-09-25T04:59:00', 49.2635, -7.22418, 6, 7, 0.69, 1, 0.94, 1],
  ['1995-09-25T07:30:00', 49.1216, -7.96871, 6, 8, 0.65, 1, 0.78, 1],
  ['1995-09-25T09:05:00', 49.0407, -8.38493, 6, 9, 0.55, 1, 0.92, 1],
];

const columnNames = [
  'time',
  'lat',
  'lon',
  'depth',
  'station',
  'extracted_chl_a',
  'quality_value_chl_a',
  'extracted_phaeopigments',
  'quality_value_phaeopigments',
];
const sampleDataColumns = columnNames.map((term) => ({
  prop: term,
  name: term,
}));

const sampleDataSheet = data.map((row) => {
  const rowModel = {};
  row.forEach((datum, i) => {
    rowModel[columnNames[i]] = datum;
  });
  return rowModel;
});

// sample meta sheet

const metaData = [
  [
    'observation',
    'Atlantic Meridional Transect (AMT)',
    'British Oceanographic Data Centre (BODC)',
    'The programme was funded and the data supplied by the Natural Environment Research Council (NERC) and further support was received from the National Aeronautics and Space Administration (NASA) with equipment and funding from the Sea-viewing Wild Field-of-view Sensor (SeaWiFS) project.',
    '', // email
    '', // history

    'This data originates from analyses on underway samples collected from the ships non-toxic supply. The seawater samples were collected approximately every 2 hours while the ship was underway. Pigment samples were filtered through Whatman GF/F filters prior to extraction in 10 ml of 90% acetone for a minimum of 15 hours and analysed using fluorometric techniques on board the ship. Chlorophyll-a data were obtained with a flow-through Turner-10 fluorometer, which used a standard Turner Designs chlorophyll fluorescence filter set. At the start of the cruise the flow-through cell was cleaned and the dessicant changed, and the instruments zero was set with a clean water blank. The cell was also regularly checked for fouling throughout the cruise.',
    'BODC reference number 1665128, EDMO code 43',
    0,
    'JR19950921',
  ],
  ['', '', '', '', '', '', '', '', '', 'AMT01'],
];
const metaColNames = [
  'dataset_make',
  'dataset_source',
  'dataset_distributor',
  'dataset_acknowledgement',
  'contact_email',
  'dataset_history',
  'dataset_description',
  'dataset_references',
  'climatology',
  'cruise_names',
];

const metaCols = metaColNames.map((term) => ({ prop: term, name: term }));

const metaSheet = metaData.map((row) => {
  const rowModel = {};
  row.forEach((datum, i) => {
    rowModel[metaColNames[i]] = datum;
  });
  return rowModel;
});

// sample variable sheet

const varColNames = [
  'var_short_name',
  'var_long_name',
  'var_sensor',
  'var_unit',
  'var_spatial_res',
  'var_temporal_res',
  'var_discipline',
  'visualize',
  'var_keywords',
  'var_comment',
];

const varCols = varColNames.map((term) => ({ prop: term, name: term }));

const varData = [
  [
    'station',
    'Station',
    '',
    '',
    'irregular',
    'irregular',
    'biology',
    '0',
    'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer,cruise, in-situ, insitu, atlantic ocean',
    '',
  ],
  [
    'extracted_chl_a',
    'Extracted Chlorophyll A',
    'Fluorometer',
    'mg/m3',
    'irregular',
    'irregular',
    'biology',
    '1',
    'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer, extracted chlorophyll a, chlorophyll, biology, cruise, in-situ, insitu, atlantic ocean',
    'Turner-10 Fluorometer',
  ],
  [
    'quality_value_chl_a',
    'Quality Value Chlorophyll A',
    '',
    '',
    'irregular',
    'irregular',
    'biology',
    '0',
    'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer, cruise, in-situ, insitu, atlantic ocean',
    'SeaDataNet Quality Control Flags key: 1 = good value, 3 = probably bad value',
  ],
  [
    'extracted_phaeopigments',
    'Extracted Phaeopigments',
    'Fluorometer',
    'ng/L',
    'irregular',
    'irregular',
    'biology',
    '1',
    'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer, extracted phaeopigments, phaeopigments, biology, cruise, in-situ, insitu, atlantic ocean',
    'Turner-10 Fluorometer',
  ],
  [
    'quality_value_phaeopigments',
    'Quality Value Phaeopigments',
    '',
    '',
    'irregular',
    'irregular',
    'biology',
    '0',
    'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer, cruise, in-situ, insitu, atlantic ocean',
    'SeaDataNet Quality Control Flags key: 1 = good value, 3 = probably bad value',
  ],
];

const varSheet = varData.map((row) => {
  const rowModel = {};
  row.forEach((datum, i) => {
    rowModel[varColNames[i]] = datum;
  });
  return rowModel;
});

export {
  sampleDataSheet,
  sampleDataColumns,
  metaCols,
  metaSheet,
  varCols,
  varSheet,
};
