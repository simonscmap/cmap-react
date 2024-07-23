import React from 'react';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { SearchResultPure } from '../../../Catalog/SearchResult';

export const dataSheet = [
  {
    label: 'time',
    anchorEnd: 'time',
    text: [
      'This column holds datetime values with the following format: %Y-%m-%dT%H:%M:%S. The date and time sections are separated by a “T” character.',
      'Example: 2010-02-09T18:15:00',
    ],
    plainText: [
      'This column holds datetime values with the following format: %Y-%m-%dT%H:%M:%S. The date and time sections are separated by a “T” character.',
      'Example: 2010-02-09T18:15:00',
    ],
    bullets: [
      'Year (%Y) is a four-digit value: example 2010',
      'Month (%m) is a two-digit value: example 02 (for Feburary)',
      'Day (%d) is a two-digit value: example 09',
      'Hour (%H) is a two-digit value from 00 to 23: example 18',
      'Minute (%M) is a two-digit value from 00 to 59: example 15',
      'Second (%S) is a two-digit value from 00 to 59: example 00',
      'Time zone: UTC',
    ],
    images: [],
  },
  {
    label: 'lat',
    anchorEnd: 'lat',
    text: [
      'This column holds the latitude values with the following characteristics:',
    ],
    plainText: [
      'This column holds the latitude values with the following characteristics:',
    ],
    bullets: [
      'Type: Numeric values from -90 to 90',
      'Format: Decimal (not military grid system)',
      'Unit: degree North',
    ],
    images: [],
  },
  {
    label: 'lon',
    anchorEnd: 'lon',
    text: [
      'This column holds the longitude values with the following characteristics:',
    ],
    plainText: [
      'This column holds the longitude values with the following characteristics:',
    ],
    bullets: [
      'Type: Numeric values from -180 to 180',
      'Format: Decimal (not military grid system)',
      'Unit: degree East',
    ],
    images: [],
  },
  {
    label: 'depth',
    anchorEnd: 'depth',
    text: [
      'This column holds the depth values with the following characteristics:',
    ],
    plainText: [
      'This column holds the depth values with the following characteristics:',
    ],
    bullets: [
      'Type: Positive numeric values. It is 0 at surface with increased values with depth.',
      'Format: Decimal',
      'Unit: meter',
    ],
    images: [],
  },
  {
    label: 'var n ... ',
    anchorEnd: 'var',
    text: [
      (<React.Fragment>
         These columns represent the dataset variables (measurements). Please
         rename them as appropriate for your data. Note that these names should
         be identical to the names defined as{' '}
         <Link href="#data-structure-var_short_name">var_short_name</Link>
         &nbsp;in the{' '}
         <Link href="#data-structure-variable">Variable Metadata</Link> sheet.
         Please do not include units in these columns; units are recorded in
         the Variable Metadata sheet. Leave a given cell empty for those
         instances when data was not taken and a value is missing. Do not
         replace the missing data with arbitrary values such as <code>99999</code>, “0”,
         “UNKNOWN”, etc. If you wish to flag specific column values, please add
         relevant flag columns with descriptions of flag values in the
         vars_meta_data comment column. Please review the example datasets in
         the <Link href="#resources">resources</Link> section for more
         information.
       </React.Fragment>)
    ],
    plainText: [''],
    bullets: [],
    images: [],
  },
];

//



export const metadataSheet = [
  {
    label: 'dataset_short_name',
    anchorEnd: 'dataset_short_name',
    text: [
      'This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers, and underscores (the first character can not be a number). Do not use space, dash, or special characters such as <, +, %, etc.',
    ],
    plainText: [
      'This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers, and underscores (the first character can not be a number). Do not use space, dash, or special characters such as <, +, %, etc.',
    ],
    bullets: ['Required: Yes', 'Constraint: Less than 50 characters'],
    images: [],
  },
  // dataset_long_name has a custom component
  {
    label: 'dataset_version',
    anchorEnd: 'dataset_version',
    text: [
      'Please assign a version number or an identifier to your dataset such as “1.0.0” or “Final”. Version identifiers will help track the evolution of a dataset over time.',
    ],
    plainText: [
      'Please assign a version number or an identifier to your dataset such as “1.0.0” or “Final”. Version identifiers will help track the evolution of a dataset over time.',
    ],
    bullets: [
      'Required: Yes',
      'Constraint: Less than 50 characters',
      'Example: 1.0',
    ],
    images: [],
  },
  {
    label: 'dataset_release_date',
    anchorEnd: 'dataset_release_date',
    text: [
      'Indicates the release date of the dataset. If your dataset has been previously published or released publicly, please specify that date. Otherwise, use the date the dataset was submitted to CMAP.',
    ],
    plainText: [
      'Indicates the release date of the dataset. If your dataset has been previously published or released publicly, please specify that date. Otherwise, use the date the dataset was submitted to CMAP.',
    ],
    bullets: [
      'Required: Yes',
      'Constraint: Less than 50 characters',
      'Example: 2020-06-22',
    ],
    images: [],
  },
  {
    label: 'dataset_make',
    anchorEnd: 'dataset_make',
    text: [
      'This is a required field that provides a broad category description of how a dataset was produced (also referred to as dataset make). Each dataset requires a single descriptor from a fixed set of options (observation, model, assimilation, laboratory), which are described below. This field will help in discovery of data in CMAP by categorizing datasets according to their Make class. Please contact us if you believe your dataset Make is not consistent with any of the categories below:',
    ],
    plainText: [
      'This is a required field that provides a broad category description of how a dataset was produced (also referred to as dataset make). Each dataset requires a single descriptor from a fixed set of options (observation, model, assimilation, laboratory), which are described below. This field will help in discovery of data in CMAP by categorizing datasets according to their Make class. Please contact us if you believe your dataset Make is not consistent with any of the categories below:',
    ],
    bullets: [
      'Observation: refers to any in-situ or remote sensing measurements such as measurements made during a cruise expedition, data from an in-situ sensor, or satellite observations. Observations made as part of laboratory experiments have their own distinct category and do not fall in this category.',
      'Model: refers to the outputs of numerical simulations.',
      'Assimilation: refers to products that are a blend of observations and numerical models.',
      'Laboratory: refers to the observations made in a laboratory setting such as culture experiment results.',
    ],
    images: [],
  },
  // dataset_source is a custom component
  {
    label: 'dataset_distributor',
    anchorEnd: 'dataset_distributor',
    text: [
      'If your dataset has already been published by a data distributor provide a link to the data distributor. Otherwise, leave this field empty.',
    ],
    plainText: [
      'If your dataset has already been published by a data distributor provide a link to the data distributor. Otherwise, leave this field empty.',
    ],
    bullets: [
      'Required: No (optional)',
      'Constraint: Less than 100 characters',
      'Example: http://marine.copernicus.eu/',
    ],
    images: [],
  },
  {
    label: 'dataset_acknowledgement',
    anchorEnd: 'dataset_acknowledgement',
    text: [
      <React.Fragment>
        Please specify how your dataset should be acknowledged when used. You
        may mention your funding agency, grant number, or you may ask those
        that use your data to acknowledge your dataset with a particular
        statement or citation. Dataset acknowlegment will be visible in the
        catalog page.
      </React.Fragment>,
    ],
    plainText: [
      `
                Specify how your dataset should be acknowledged. You may mention your funding agency, grant number, or
                you may ask those that use your data to acknowledge your dataset with a particular statement. Dataset
                acknowlegment will be visible in the catalog page.
            `,
    ],
    bullets: ['Required: Yes', 'Constraint: No length limits'],
    images: [
      {
        src: '/images/cmap_acknowledgement_dataset_page.png',
        alt: 'Dataset Acknowledgment in Catalog',
        caption:
        'Figure 6. A sample dataset shown in the Simons CMAP catalog. The "dataset_acknowledgement" is enclosed in the orange rectangle.',
        id: 'fig-6',
      },
    ],
  },
  {
    label: 'dataset_history',
    anchorEnd: 'dataset_history',
    text: [
      'Use this field if your dataset has evolved over time and you wish to add notes about the history of your dataset. Otherwise, leave this field empty.',
    ],
    plainText: [
      'Use this field if your dataset has evolved over time and you wish to add notes about the history of your dataset. Otherwise, leave this field empty.',
    ],
    bullets: ['Required: No (optional)'],
    images: [],
  },
  {
    label: 'dataset_description',
    anchorEnd: 'dataset_description',
    text: [
      <React.Fragment>
        Your description serves as the dataset documentation visible in the
        Simons CMAP catalog and helps users understand your dataset. The
        description should include information about the data that is
        contained in the dataset as well as how and where samples were
        collected and processed. It can also include figures and links to
        external content. It is recommended that the description provide the
        context of the dataset, including a brief overview of any larger
        sampling program if applicable.
      </React.Fragment>,
    ],
    plainText: [
      `
                Your description serves as the dataset documentation visible in the Simons CMAP catalog and helps users
                understand your dataset.  The description should include information about the data that is contained in the
                dataset as well as how and where samples were collected and processed. It can also include figures and links to
                external content. It is recommended that the description provide the context of the dataset, including a brief
                overview of any larger sampling program if applicable.
            `,
    ],

    bullets: ['Required: Yes', 'Constraint: No length limits'],
    images: [
      {
        src: '/images/cmap_dataset_description.png',
        alt: 'Dataset description in Catalog',
        caption:
        'Figure 7. Example of a dataset description visible in the CMAP catalog.',
        id: 'fig-7',
      },
    ],
  },
  {
    label: 'dataset_references',
    anchorEnd: 'dataset_references',
    text: [
      'List any publications or documentation that one may cite in reference to the dataset. If there are more than one reference, please put them in separate cells under the dataset_reference column. Leave this field empty if there are no publications associated with this dataset.',
    ],
    plainText: [
      'List any publications or documentation that one may cite in reference to the dataset. If there are more than one reference, please put them in separate cells under the dataset_reference column. Leave this field empty if there are no publications associated with this dataset.',
    ],
    bullets: ['Required: No (optional)'],
    images: [],
  },
  {
    label: 'climatology',
    anchorEnd: 'climatology',
    text: [
      'This is a flag indicating whether the dataset represents a climatological product. If your dataset is a climatological product fill this field with “1”. Otherwise, leave this field blank.',
    ],
    plainText: [
      'This is a flag indicating whether the dataset represents a climatological product. If your dataset is a climatological product fill this field with “1”. Otherwise, leave this field blank.',
    ],
    bullets: ['Required: No (optional)'],
    images: [],
  },
  {
    label: 'cruise_names',
    anchorEnd: 'cruise_names',
    text: [
      <React.Fragment>
        If your dataset represents measurements made during a cruise
        expedition (or expeditions), provide a list of cruise official names
        here. If your dataset is associated with more than one cruise, please
        put them in separate cells under the cruise_names column. If the
        cruises have any nicknames, please list them in separate cells as well. Leave this field blank if your
        dataset is not associated with a cruise expedition.
      </React.Fragment>,
    ],
    plainText: [
      'If your dataset represents measurements made during a cruise expedition (or expeditions), provide a list of cruise official names here. If your dataset is associated with more than one cruise, please put them in separate cells under the cruise_names column. If the cruises have any nicknames, please list them in separate cells as well. Leave this field blank if your dataset is not associated with a cruise expedition.',
    ],
    bullets: ['Required: No (optional)', 'Constraint: No length limits'],
    images: [],
  },
];

export const variableMetadataSheet = [
  {
    label: 'var_short_name',
    anchorEnd: 'var_short_name',
    text: [
      <React.Fragment>
        This name is meant to be used in programming codes and scripts. It
        should only contain a combination of letters, numbers, and underscores
        (the first character can not be a number). Do not use space, dash, or
        special characters such as {'<'}, +, %, etc. Finally, there must be a
        one-to-one match between the short_names listed here and the variable
        column names in the “Data” sheet (see{' '}
        <Link href="#data-structure-var">vars</Link>). var_short_name will be
        seen in the CMAP catalog.
      </React.Fragment>,
    ],
    plainText: [
      `
                This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers,
                and underscores (the first character can not be a number). Do not use space, dash, or special characters such as <, +,
                %, etc. Finally, there must be a one-to-one match between the short_names listed here and the variable column names in the
                “Data” sheet. var_short_name will be seen in the CMAP catalog.
            `,
    ],
    bullets: ['Required: Yes', 'Constraint: Less than 50 characters'],
    images: [
      {
        src: '/images/cmap_variable_short_name_on_dataset_page.png',
        alt: 'Variable short name in catalog',
        caption:
        'Figure 9. A sample dataset shown in the Simons CMAP catalog. The "var_short_name" is highlighted in the orange rectangle.',
        id: 'fig-9',
      },
    ],
  },
  {
    label: 'var_long_name',
    anchorEnd: 'var_long_name',
    text: [
      <React.Fragment>
        A descriptive and human-readable label for the variable in accordance
        with the CF and COARDS conventions. This name will present your
        variable in the CMAP catalog,
        visualization search dialog, and
        will appear as the title of figures generated on the vizualization
        page. var_long_name can contain any unicode character, but please
        avoid names longer than 200 characters as they may get trimmed while
        displayed on graphical interfaces. Please use&nbsp;
        <Link href="#data-structure-var_comment">var_comment</Link> if you
        would like to add a full textual description (with no length limits)
        for your variable.
      </React.Fragment>,
                                               ],
    plainText: [
      `
                A descriptive and human-readable label for the variable in accordance with the CF and COARDS conventions.
                This name will present your variable in the CMAP catalog, visualization search dialog, and will appear as the title of figures generated
                on the vizualization page. var_long_name can contain any unicode character,
                but please avoid names longer than 200 characters as they may get trimmed while displayed on graphical interfaces. Please use var_comment
                if you would like to add a full textual description (with no length limits) for your variable.
            `,
    ],
    bullets: ['Required: Yes', 'Constraint: Less than 200 characters'],
    images: [
      {
        src: '/images/cmap_variable_long_name_on_dataset_page.png',
        alt: 'Variable long name in catalog',
        caption:
        'Figure 10. A sample dataset shown in the Simons CMAP catalog. The "var_long_name" is highlighted in the orange rectangle.',
        id: 'fig-10',
      },
      {
        src: '/images/cmap_variable_long_name_on_viz_page.png',
        alt: 'var long name in visualization page',
        caption:
        'Figure 11. The "var_long_name" appears in the visualization page search dialog.',
        id: 'fig-11',
      },
    ],
  },
  {
    label: 'var_sensor',
    anchorEnd: 'var_sensor',
    text: [
      <React.Fragment>
        This is a required field that refers to the instrument used to produce
        the measurements such as CTD, fluorometer, flow cytometer, sediment
        trap, etc. If your dataset is the output of a numerical model or a
        combination of model and observation, use the term “simulation” and
        “blend”, respectively. This field will significantly help to find and
        categorize data generated using a similar class of instruments.
        var_sensor will be visible in the Simons CMAP catalog. This field is
        populated via a dropdown menu. If a value you would like to use is
        missing from the dropdown menu please contact us at{' '}
        <Link href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </Link>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    plainText: [
      'This is a required field that refers to the instrument used to produce the measurements such as CTD, fluorometer, flow cytometer, sediment trap, etc. If your dataset is the output of a numerical model or a combination of model and observation, use the term “simulation” and “blend”, respectively. This field will significantly help to find and categorize data generated using a similar class of instruments. var_sensor will be visible in the Simons CMAP catalog. This field is populated via a dropdown menu.  If a value you would like to use is missing from the dropdown menu please contact us at cmap-data-submission@uw.edu to request that it be added.',
    ],
    bullets: [],
    images: [],
  },
  {
    label: 'var_unit',
    anchorEnd: 'var_unit',
    text: [
      <React.Fragment>
        In this column, enter the units of each variable, if applicable. Leave
        this field blank if your variable is unitless (e.g. “station numbers”
        or “quality flags”). Units may contain unicode characters such as
        subscripts and superscripts. var_unit will be visible in the Simons
        CMAP catalog and in the
        generated visualizations.
      </React.Fragment>,
    ],
    plainText: [
      `
            In this column, enter the units of each variable, if applicable. Leave this field blank if your variable is unitless (e.g. “station numbers” or “quality
                flags”). Units may contain unicode characters such as subscripts and superscripts. var_unit will be visible in the Simons CMAP
                catalog and in the generated visualizations.
            `,
    ],
    bullets: [
      'Required: No (optional)',
      'Constraint: Less than 50 characters',
      <React.Fragment>
        Example: ug L<sup>-1</sup>
      </React.Fragment>,
    ],
    images: [],
  },
  {
    label: 'var_spatial_res',
    anchorEnd: 'var_spatial_res',
    text: [
      <React.Fragment>
        Specifies the spatial resolution of the variable. Typically, gridded
        products have uniform spatial spacing (such as 0.25° X 0.25°) while
        field expeditions do not have a regular spatial resolution. If your
        variable does not have a regular spatial resolution, use the term
        “irregular” to fill out this field. Note that if samples are taken at
        a series of distinct but spatially-non-uniform stations, the spatial
        resolution is considered irregular. var_spatial_res may contain
        unicode characters such as degree symbol ( ° ) and will be visible in
        the Simons CMAP catalog. This
        field is populated via a dropdown menu. If a value you would like to
        use is missing from the dropdown menu please contact us at{' '}
        <Link href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </Link>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    plainText: [
      `
                Specifies the spatial resolution of the variable. Typically, gridded products have uniform spatial spacing (such as 0.25° X 0.25°)
                while field expeditions do not have a regular spatial resolution. If your variable does not have a regular spatial resolution,
                use the term “irregular” to fill out this field. Note that if samples are taken at a series of distinct but spatially-non-uniform
                stations, the spatial resolution is considered irregular. var_spatial_res may contain unicode characters such as degree symbol ( ° )
                and will be visible in the Simons CMAP catalog. This field is populated via a dropdown menu.  If a value you would like to use is
                missing from the dropdown menu please contact us at cmap-data-submission@uw.edu to request that it be added.
            `,
    ],
    bullets: [
      'Required: Yes',
      'Constraint: Less than 50 characters',
      'Example: irregular',
    ],
    images: [],
  },
  {
    label: 'var_temporal_res',
    anchorEnd: 'var_temporal_res',
    text: [
      <React.Fragment>
        Entries in this column describe the temporal resolution (daily,
        hourly, 3-minutes, etc). If the measurements do not have a regular
        temporal spacing, use the term “irregular” to fill out this field.
        var_temporal_res will be visible in the Simons CMAP catalog. This field is populated via a
        dropdown menu. If a value you would like to use is missing from the
        dropdown menu please contact us at{' '}
        <Link href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </Link>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    plainText: [
      `
                Entries in this column describe the temporal resolution (daily, hourly, 3-minutes, etc). If the measurements do not have a
                regular temporal spacing, use the term “irregular” to fill out this field. var_temporal_res will be visible in the Simons CMAP
                catalog. This field is populated via a dropdown menu. If a value you would like to use is missing from the dropdown menu please contact us at cmap-data-submission@uw.edu to request that it be added.
            `,
    ],
    bullets: [
      'Required: Yes',
      'Constraint: Less than 50 characters',
      'Example: irregular',
    ],
    images: [],
  },
  {
    label: 'var_discipline',
    anchorEnd: 'var_discipline',
    text: [
      <React.Fragment>
        Indicates in which disciplines (such as Physics, Biology …) this
        variable is commonly studied. You can list more than one discipline.
        If you list multiple disciplines per variable, please separate them by
        +. This field is populated via a dropdown menu. If a value you would
        like to use is missing from the dropdown menu please contact us at{' '}
        <Link href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </Link>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    plainText: [
      `
                Indicates in which disciplines (such as Physics, Biology …) this variable is commonly studied. You can specify more than one
                discipline. If you list multiple disciplines per variable, please separate them by +. This field is populated via a dropdown menu.
                If a value you would like to use is missing from the dropdown menu please contact us at
                cmap-data-submission@uw.edu to request that it be added.
            `,
    ],
    bullets: [
      'Required: Yes',
      'Constraint: Less than 100 characters',
      'Example: Physics+BioGeoChemistry',
    ],
    images: [],
  },
  {
    label: 'visualize',
    anchorEnd: 'visualize',
    text: [
      'This is a flag field and can only be 0 (not visualizable) or a 1 (visualizable). Fill this field with 1, if you think this variable can be visualized on a graph. In principle, any variable with numeric values can be visualized while variables with string values, station numbers, or quality flags may not be the best candidates for visualization in CMAP. Please consult with the data curation team if you have any questions.',
    ],
    plainText: [
      'This is a flag field and can only be 0 (not visualizable) or a 1 (visualizable). Fill this field with 1, if you think this variable can be visualized on a graph. In principle, any variable with numeric values can be visualized while variables with string values, station numbers, or quality flags may not be the best candidates for visualization in CMAP. Please consult with the data curation team if you have any questions.',
    ],
    bullets: ['Required: Yes'],
    images: [],
  },
  {
    label: 'var_keywords',
    anchorEnd: 'var_keywords',
    text: [
      'Every variable in CMAP is annotated with a range of semantically related keywords to ensure a variable can be easily discovered. For example, use of keywords allows you to search using the term “PO4” and retrieve a list of all phosphate data even if “PO4” was not used as name for a given dataset. Similarly, if one searches for “MIT”, CMAP returns all variables generated by MIT groups, or if one looks for “model”, only model outputs are returned. These “semantic” searches are made possible using the keywords that are added to each variable. Keywords should include the attributes described below:.',
    ],
    plainText: [
      'Every variable in CMAP is annotated with a range of semantically related keywords to ensure a variable can be easily discovered. For example, use of keywords allows you to search using the term “PO4” and retrieve a list of all phosphate data even if “PO4” was not used as name for a given dataset. Similarly, if one searches for “MIT”, CMAP returns all variables generated by MIT groups, or if one looks for “model”, only model outputs are returned. These “semantic” searches are made possible using the keywords that are added to each variable. Keywords should include the attributes described below:',
    ],
    bullets: [
      'Alternative names: other official, unofficial, abbreviation, technical (or jargon) names or notations associated with the variable. Examples: Nitrate, NO3, NO_3',
      'Method and Instrument: Keywords related to the method and instruments used for the variable measurements. Examples: observation, in-situ, model, satellite, remote sensing, cruise, CTD, cytometry, ….',
      'Data Producers: Keywords associated with the lead scientist/lab name/institute name. Examples: UW, University of Washington, Virginia Armbrust, Ginger',
      'Cruise: The official UNOLS/unofficial name(s) of the cruise(s) during which the variable was measured, if applicable. Examples: KOK1606, Gradients_1, diel',
      'Project name: If your data are in the context of a project, include the project name. Examples: HOT, Darwin, SeaFlow',
      'Collection Region: Regions and subregions where the data was collected.  Examples: North Atlantic, North Pacific Subtropical Gyre, NPSG, Sargasso Sea',
      'Organism name:  Names of any organisms associated with that variable.',
      'Please note that there is no limit to the number of keywords used for a variable. Keywords are not mutually exclusive. For example, a CTD temperature measurement made during a cruise can have all of the following keywords: observation, in-situ, cruise, CTD. Keywords are case-insensitive and you may add/remove them at any point (even after data ingestion). This is a required field.',
      'Required: Yes',
    ],
    images: [],
  },
  {
    label: 'var_comment',
    anchorEnd: 'var_comment',
    text: [
      <React.Fragment>
        Use this field to communicate any detailed information about this
        particular variable with the users. Examples of a comment could
        include but are not limited to: a description of method(s) used to
        process raw measurements, a specific instrument name or model number,
        a key describing numbered flags, and links to references or protocols
        specific to a particular variable. var_comment is visible in the
        Simons CMAP catalog.
      </React.Fragment>,
    ],
    plainText: [
      `
                Use this field to communicate any detailed information about this particular variable with the users. Examples of a comment could include but are not limited to: a description of method(s) used to process raw
                measurements, a specific instrument name or model number, a key describing numbered flags, and links to
                references or protocols specific to a particular variable. var_comment is visible in the Simons CMAP
                catalog.
            `,
    ],
    bullets: ['Required: No (optional)', 'Constraint: No length limits'],
    images: [
      {
        src: '/images/var_comment_on_dataset_page.png',
        alt: 'Variable description in Catalog',
        caption:
        'Figure 12. A sample dataset shown in the Simons CMAP catalog with the Comment column highlighted in the orange rectangle. If short enough, the "var_comment" is shown in the cell on the catalog page, otherwise it is accessible using the "View Comment" link.',
        id: 'fig-12',
      },
    ],
  },
];

// export a map from id to data

export const map = new Map();
// Data Sheet
map.set ('time-column', dataSheet[0]);
map.set ('lat-column', dataSheet[1]);
map.set ('lon-column', dataSheet[2]);
map.set ('depth-column', dataSheet[3]);
map.set ('var-n-columns', dataSheet[4]);
// Metadata Sheet
map.set ('dataset_short_name', metadataSheet[0]);
// map.set ('dataset_long_name-column', metadataSheet[1]); // this is now a custom component
map.set ('dataset_version-column', metadataSheet[1]);
map.set ('dataset_release_date-column', metadataSheet[2]);
map.set ('dataset_make-column', metadataSheet[3]);
// map.set ('dataset_source-column', metadataSheet[4]); // this is now a custom component
map.set ('dataset_distributor-column', metadataSheet[4]);
map.set ('dataset_acknowledgment-column', metadataSheet[5]);
map.set ('dataset_history-column', metadataSheet[6]);
map.set ('dataset_description-column', metadataSheet[7]);
map.set ('dataset_references-column', metadataSheet[8]);
map.set ('climatology-column', metadataSheet[9]);
map.set ('cruise_names-column', metadataSheet[10]);

// Variable Metadata Sheet
map.set ('var_short_name-column', variableMetadataSheet[0]);
map.set ('var_long_name-column', variableMetadataSheet[1]);
map.set ('var_sensor-column', variableMetadataSheet[2]);
map.set ('var_unit-column', variableMetadataSheet[3]);
map.set ('var_spatial_res-column', variableMetadataSheet[4]);
map.set ('var_temporal_res-column', variableMetadataSheet[5]);
map.set ('var_discipline-column', variableMetadataSheet[6]);
map.set ('visualize-column', variableMetadataSheet[7]);
map.set ('var_keywords-column', variableMetadataSheet[8]);
map.set ('var_comment-column', variableMetadataSheet[9]);
