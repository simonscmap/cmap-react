export const textAreaLookup = {
  var_keywords: 4,
  var_comment: 5,
  var_long_name: 3,
  dataset_references: 8,
  dataset_description: 14,
  dataset_acknowledgement: 8,
  cruise_names: 5,
  dataset_long_name: 3,
  dataset_history: 3,
  dataset_distributor: 3,
};

export const validationSteps = [
  {
    // before selecting file
  },

  {
    label: 'Workbook Validation',
  },
  {
    label: 'Data Sheet Validation',
  },
  {
    label: 'Submission',
  },
];

export const auditKeyToLabel = {
  workbook: 'Workbook',
  data: 'Data Sheet',
  dataset_meta_data: 'Metadata Sheet',
  vars_meta_data: 'Variable Metadata Sheet',
}


export const _old_validationSteps = [
  {
    // before selecting file
  },

  {
    label: 'Workbook Validation',
    sheet: 'workbook',
  },

  {
    label: 'Data Sheet',
    sheet: 'data',
  },

  {
    label: 'Dataset Metadata Sheet',
    sheet: 'dataset_meta_data',
  },

  {
    label: 'Variable Metadata Sheet',
    sheet: 'vars_meta_data',
  },

  {
    label: 'Submission',
    sheet: 'submission',
  },
];


export const orderedColumns = {
  data: ['time', 'lat', 'lon', 'depth'],
  dataset_meta_data: [
    'dataset_short_name',
    'dataset_long_name',
    'dataset_version',
    'dataset_release_date',
    'dataset_make',
    'cruise_names',
    'dataset_source',
    'dataset_distributor',
    'dataset_acknowledgement', //'contact_email'
    ,
    'dataset_doi',
    'dataset_history',
    'dataset_description',
    'dataset_references',
    'climatology',
  ],
  vars_meta_data: [
    'var_short_name',
    'var_long_name',
    'var_unit',
    'var_sensor',
    'var_spatial_res',
    'var_temporal_res',
    'var_discipline',
    'visualize',
    'var_keywords',
    'var_comment',
  ],
};

export const fileSizeTooLargeDummyState = {
  auditReport: {
    workbook: {
      errors: [
        'This workbook exceeds the file size limit of this application. Please contact our data curation team at cmap-data-submission@uw.edu for assistance.',
      ],
      warnings: [],
    },
    data: [],
    dataset_meta_data: [],
    vars_meta_data: [],
  },
  validationStep: 1,
};
