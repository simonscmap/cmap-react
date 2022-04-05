export const pythonTree = {
  id: 'root',
  name: 'Python Package',
  children: [
    {
      id: '1',
      name: 'Installation',
      link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_install.html',
    },
    {
      id: '2',
      name: 'Data Retrieval',
      link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_data_retrieval.html#dataret',
      children: [
        {
          id: '2.1',
          name: 'API',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_api.html#pycmapapi',
        },
        {
          id: '2.2',
          name: 'Query',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_query.html#query',
        },
        {
          id: '2.3',
          name: 'Catalog',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_catalog.html#getcatalog',
        },
        {
          id: '2.4',
          name: 'Search Catalog',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_search_catalog.html#searchcatalog',
        },
        {
          id: '2.5',
          name: 'Datasets',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_dataset.html#dataset-list',
        },
        {
          id: '2.6',
          name: 'Metadata',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_metadata.html#metadata',
        },
        {
          id: '2.7',
          name: 'Dataset Metadata',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_dataset_metadata.html#datasetmetadata',
        },
        {
          id: '2.8',
          name: 'Dataset Columns',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_dataset_columns.html#columns',
        },
        {
          id: '2.9',
          name: 'Dataset Head',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_dataset_head.html#dataset-head',
        },
        {
          id: '2.10',
          name: 'Variable Long Name',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_variable_long_name.html#var-long-name',
        },
        {
          id: '2.11',
          name: 'Variable Unit',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_variable_unit.html#var-unit',
        },
        {
          id: '2.12',
          name: 'Variable Resolution',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_variable_resolution.html#varres',
        },
        {
          id: '2.13',
          name: 'Variable Coverage',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_var_coverage.html#varcover',
        },
        {
          id: '2.14',
          name: 'Variable Stat',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_var_stat.html#varstat',
        },
        {
          id: '2.15',
          name: 'If Column Exists',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_has_field.html#hasfield',
        },
        {
          id: '2.16',
          name: 'Is Gridded Product',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_is_gridded.html#gridded',
        },
        {
          id: '2.17',
          name: 'Is Climatology Product',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_is_climatology.html#clim',
        },
        {
          id: '2.18',
          name: 'List of Cruises',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_list_cruises.html#list-cruises',
        },
        {
          id: '2.19',
          name: 'Cruise Details by Name',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_cruise_details.html#cruise-details',
        },
        {
          id: '2.20',
          name: 'Cruise Spatio-Temporal Bounds',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_cruise_ST_bounds.html#cruise-st',
        },
        {
          id: '2.21',
          name: 'Cruise Trajectory',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_cruise_trajectory.html#cruise-traj',
        },
        {
          id: '2.22',
          name: 'Cruise Variables',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_cruise_variables.html#cruisevars',
        },
        {
          id: '2.23',
          name: 'Retrieve Dataset',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_retrieve_dataset.html#retrieve-dataset',
        },
        {
          id: '2.24',
          name: 'Data Subset: Generic Space-Time Cut',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_subset_ST.html#subset-st',
        },
        {
          id: '2.25',
          name: 'Data Subset: Time Series',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_subset_TS.html#subset-ts',
        },
        {
          id: '2.26',
          name: 'Data Subset: Depth Profile',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_subset_DP.html#subset-dp',
        },
        {
          id: '2.27',
          name: 'Match (colocalize) Datasets',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_match_datasets.html#match',
        },
        {
          id: '2.28',
          name: 'Match (colocalize) Cruise Track with Datasets',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_retrieval/pycmap_match_cruise_track_datasets.html#matchcruise',
        },
      ],
    },
    {
      id: '3',
      name: 'Data Visualization',
      link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_data_vizualization.html#dataviz',
      children: [
        {
          id: '3.1',
          name: 'Histogram Plot',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_histogram.html#histogram',
        },
        {
          id: '3.2',
          name: 'Time Series Plot',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_time_series.html#timeseries',
        },
        {
          id: '3.3',
          name: 'Regional Map, Contour Plot, 3D Surface Plot',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_rm_cp_3d.html#rmcp3d',
        },
        {
          id: '3.4',
          name: 'Section Map, Section Contour',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_section_map_contour.html#sectionmapcontour',
        },
        {
          id: '3.5',
          name: 'Depth Profile',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_depth_profile.html#depthprofile',
        },
        {
          id: '3.6',
          name: 'Cruise Track Plot',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_cruise_track.html#cruisetrackplot',
        },
        {
          id: '3.7',
          name: 'Correlation Matrix',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_correlation_matrix.html#corrmatrix',
        },
        {
          id: '3.8',
          name: 'Correlation Matrix Along Cruise Track',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_correlation_matrix_cruise_track.html#corrmatrixcruise',
        },
        {
          id: '3.9',
          name: 'Climatology',
          link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/data_vizualization/pycmap_climatology.html#climatology',
        },
      ],
    },
    {
      id: '4',
      name: 'Presentations',
      link: 'https://cmap.readthedocs.io/en/latest/user_guide/API_ref/pycmap_api/pycmap_presentations.html',
    },
  ],
};
