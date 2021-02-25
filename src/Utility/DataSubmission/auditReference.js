const auditReference = {
    data: [
        'time',
        'lat',
        'lon',
        'depth'
    ],

    dataset_meta_data: [
        'dataset_short_name',
        'dataset_long_name',
        'dataset_version',
        'dataset_release_date',
        'dataset_make',
        'dataset_source',
        'dataset_distributor',
        'dataset_acknowledgement',
        'dataset_history',
        'dataset_description',
        'dataset_references',
        'climatology',
        'contact_email',
        'cruise_names'
    ],

    vars_meta_data: [
        'var_short_name',
        'var_long_name',
        'var_sensor',
        'var_unit',
        'var_spatial_res',
        'var_temporal_res',
        'var_discipline',
        'visualize',
        'var_keywords',
        'var_comment'
    ]
};

export default auditReference;