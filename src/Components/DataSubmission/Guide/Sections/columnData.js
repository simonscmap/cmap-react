import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { GuideLink } from '../Links';

export const dataSheet = [
  {
    label: 'time',
    text: [
      <span key={'1'}>This column holds datetime values with the following format: <code>%Y-%m-%dT%H:%M:%S</code>. The date and time sections are separated by a “T” character. Example: <code>2010-02-09T18:15:00</code>.</span>,
      <span key={'2'}>
        If your data is not in UTC time zone, explicitly specify the time zone offset using this format: <code>%Y-%m-%dT%H:%M:%S%z</code>, as in the example <code>2024-07-24T21:48:32.485+11:00</code>, otherwise it might be interpreted as UTC.
      </span>
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
    meta: {
      type: 'Date or Datetime',
      format: 'see below',
      required: true,
      example: '2024-07-24T21:48:32.485Z'
    }
  },
  {
    label: 'lat',
    text: [
      'This column holds the latitude values with the following characteristics:',
    ],
    meta: {
      type: 'Numeric values from -90 to 90',
      format: 'Decimal (not military grid system)',
      unit: 'degree North',
      required: true,
      // example: '',
    }
  },
  {
    label: 'lon',
    text: [
      'This column holds the longitude values with the following characteristics:',
    ],
    meta: {
      type: 'Numeric values from -180 to 180',
      format: 'Decimal (not military grid system)',
      unit: 'degree East',
      required: true,
    }
  },
  {
    label: 'depth',
    text: [
      'This column holds the depth values with the following characteristics:',
    ],
    meta: {
      type: 'Positive numeric values. It is 0 at surface with increased values with depth.',
      format: 'Decimal',
      unit: 'meter',
      required: true,
    }
  },
  {
    label: 'var n ... ',
    text: [
      (<React.Fragment key="1">
         These columns represent the dataset variables (measurements). Please
         rename them as appropriate for your data. Note that these names should
         be identical to the names defined as{' '}
         <GuideLink hash="#var_short_name-column">var_short_name</GuideLink>
         &nbsp;in the{' '}
         <GuideLink href="#variable-metadata-sheet">Variable Metadata</GuideLink> sheet.
         Please do not include units in these columns; units are recorded in
         the Variable Metadata sheet. Leave a given cell empty for those
         instances when data was not taken and a value is missing. Do not
         replace the missing data with arbitrary values such as <code>99999</code>, “0”,
         “UNKNOWN”, etc. If you wish to flag specific column values, please add
         relevant flag columns with descriptions of flag values in the
         vars_meta_data comment column. Please review the example datasets in
         the <GuideLink href="#resources">Resources</GuideLink> section for more
         information.
       </React.Fragment>)
    ],
  },
];

//



export const metadataSheet = [
  {
    label: 'dataset_short_name',
    text: [
      'This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers, and underscores (the first character can not be a number). Do not use space, dash, or special characters such as <, +, %, etc.',
    ],
    meta: {
      required: true,
      constraints: [
        'Less than 50 characters'
      ]
    }
  },
  // dataset_long_name has a custom component
  {
    label: 'dataset_version',
    text: [
      'Please assign a version number or an identifier to your dataset such as “1.0.0” or “Final”. Version identifiers will help track the evolution of a dataset over time.',
    ],
    meta: {
      required: true,
      constraints: [
        'Less than 50 characters'
      ],
      example: '1.0'
    },
  },
  {
    label: 'dataset_release_date',
    text: [
      'Indicates the release date of the dataset. If your dataset has been previously published or released publicly, please specify that date. Otherwise, use the date the dataset was submitted to CMAP.',
    ],
    meta: {
      required: true,
      constraints: [
        'Less than 50 characters'
      ],
      example: '2020-06-22'
    }
  },
  {
    label: 'dataset_make',
    anchorEnd: 'dataset_make',
    text: [
      'This is a required field that provides a broad category description of how a dataset was produced (also referred to as dataset make). Each dataset requires a single descriptor from a fixed set of options:',
      <div style={{ paddingLeft: '20px'}} key="a">
        <List>
          <ListItem><code>{'Observation'}</code></ListItem>
          <ListItem><code>{'Model'}</code></ListItem>
          <ListItem><code>{'Assimilation'}</code></ListItem>
          <ListItem><code>{'Laborotory'}</code></ListItem>
        </List>
      </div>,
        'This field will help in discovery of data in CMAP by categorizing datasets according to their Make class. Please contact us if you believe your dataset Make is not consistent with any of the categories.',
      <span key="b"><code>Obeservation</code> refers to any in-situ or remote sensing measurements such as measurements made during a cruise expedition, data from an in-situ sensor, or satellite observations. Observations made as part of laboratory experiments have their own distinct category and do not fall in this category.</span>,
      <span key="c"><code>Model</code> refers to the outputs of numerical simulations.</span>,
      <span key="d"><code>Assimilation</code> refers to products that are a blend of observations and numerical models.</span>,
      <span key="e"><code>Laborotory</code> refers to the observations made in a laboratory setting such as culture experiment results.</span>,
    ],
    meta: {
      required: true,
    }
  },
  // dataset_source is a custom component
  {
    label: 'dataset_distributor',
    text: [
      <span key="1">If your dataset has already been published by a data distributor provide a link to the data distributor.Otherwise, fill this field with the same content as the <code>dataset_source</code>.</span>,
    ],
    meta: {
      required: false,
      constraints: ['Less than 100 characters'],
      example: 'http://marine.copernicus.eu/'
    },
  },
  {
    label: 'dataset_acknowledgement',
    text: [
      <React.Fragment key="1">
        Please specify how your dataset should be acknowledged when used. You
        may mention your funding agency, grant number, or you may ask those
        that use your data to acknowledge your dataset with a particular
        statement or citation. Dataset acknowlegment will be visible in the
        <GuideLink href="/catalog">Catalog</GuideLink>.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      constraints: ['No length limits']
    },
    images: [
      {
        src: '/images/cmap_acknowledgement_dataset_page.png',
        alt: 'Dataset Acknowledgment in Catalog',
        caption:
        'Figure 6. A sample dataset shown in the Simons CMAP catalog. The "dataset_acknowledgement" is enclosed in the orange rectangle.',
        id: 'fig-6',
        width: '1280px',
      },
    ],
  },
  {
    label: 'dataset_history',
    text: [
      'Use this field if your dataset has evolved over time and you wish to add notes about the history of your dataset. Otherwise, leave this field empty.',
    ],
    meta: {
      required: false,
      type: 'Text',
    },
  },
  {
    label: 'dataset_description',
    text: [
      <React.Fragment key="1">
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
    meta: {
      required: true,
      constraints: ['No length limit']
    },
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
      <span key="1">
        List any publications or documentation that one may cite in reference to the dataset, as well as references for any citations included in the description. If there is more than one reference, please put them in separate cells under the <code>dataset_reference</code> column. Leave this field empty if there are no references associated with this dataset.
      </span>
    ],
    meta: {
      required: false
    },
  },
  {
    label: 'climatology',
    text: [
      <span key="1">This is a flag indicating whether the dataset represents a climatological product. If your dataset is a climatological product fill this field with <code>1</code>. Otherwise, fill this field with <code>0</code>.</span>,
    ],
    meta: {
      required: false,
    }
  },
  {
    label: 'cruise_names',
    text: [
      <span key="1">
        If your dataset represents measurements made during a cruise expedition (or expeditions), provide the cruise official names here (e.g. <code>KM1821</code>). If your dataset is associated with more than one cruise, please put them in separate cells under the <code>cruise_names</code> column. If the cruises have any nicknames, please list these in separate cells as well. Leave this field blank if your dataset is not associated with a cruise expedition.
      </span>,
    ],
    meta: {
      required: false,
      constraints: ['No length limit']
    },
  },
];

export const variableMetadataSheet = [
  {
    label: 'var_short_name',
    text: [
      <React.Fragment key="1">
        This name is meant to be used in programming codes and scripts. It
        should only contain a combination of letters, numbers, and underscores
        (the first character can not be a number). Do not use space, dash, or
        special characters such as <code>{'<'}</code>, <code>+</code>, <code>%</code>, etc. Finally, there must be a
        one-to-one match between the <code>short_name</code>s listed here and the variable
        column names in the “Data” sheet (see <GuideLink href="#var-n-columns">vars</GuideLink>). <code>var_short_name</code> will be seen in the CMAP catalog.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      constraints: ['Less than 50 characters']
    },
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
    text: [
      <React.Fragment key="1">
        A descriptive and human-readable label for the variable in accordance
        with the CF and COARDS conventions. This name will present your
        variable in the CMAP catalog,
        visualization search dialog, and
        will appear as the title of figures generated on the vizualization
        page. <code>var_long_name</code> can contain any unicode character, but please
        avoid names longer than 200 characters as they may get trimmed while
        displayed on graphical interfaces. Please use&nbsp;
        <GuideLink href="#var_comment-column">var_comment</GuideLink> if you
        would like to add a full textual description (with no length limits)
        for your variable.
      </React.Fragment>,
                                               ],
    meta: {
      required: true,
      constraints: ['Less than 200 characters']
    },
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
        alt: 'var_long_name in the Visualization Page',
        caption:
        'Figure 11. The "var_long_name" appears in the visualization page search dialog.',
        id: 'fig-11',
      },
    ],
  },
  {
    label: 'var_sensor',
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
        missing from the dropdown menu please contact us at <GuideLink href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </GuideLink> to request that it be added.
      </React.Fragment>,
    ],
    meta: {
      required: true,
    }
  },
  {
    label: 'var_unit',
    text: [
      <React.Fragment>
        In this column, enter the units of each variable, if applicable. Leave
        this field blank if your variable is unitless (e.g. “station numbers”
        or “quality flags”). Units may contain unicode characters such as
        subscripts and superscripts. <code>var_unit</code> will be visible in the Simons
        CMAP catalog and in the generated visualizations.
      </React.Fragment>,
    ],
    meta: {
      required: false,
      constraints: ['Less than 50 characters'],
      example: <span>ug L<sup>-1</sup></span>
    },
  },
  {
    label: 'var_spatial_res',
    anchorEnd: 'var_spatial_res',
    text: [
      <span key="1">
        Entries in this column describe the spatial resolution of the variable. Typically, gridded products have uniform spatial spacing (such as <code>0.25° X 0.25°</code>) while field expeditions do not. If your variable does not have a regular spatial resolution, use the term <code>irregular</code> to fill out this field. Note that if samples are taken at a series of distinct but spatially-non-uniform stations, the spatial resolution is considered irregular. <code>var_spatial_res</code> may contain unicode characters such as degree symbol (<code> ° </code>) and will be visible in the Simons CMAP catalog. This field is populated via a dropdown menu. If a value you would like to use is missing from the dropdown menu please contact us at <GuideLink href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</GuideLink> to request that it be added.
      </span>,
    ],
    meta: {
      required: true,
      constraints: ['Less than 50 characters'],
      example: 'irregular'
    },
  },
  {
    label: 'var_temporal_res',
    anchorEnd: 'var_temporal_res',
    text: [
      <React.Fragment>
        Entries in this column describe the temporal resolution (<code>daily</code>,
        <code>hourly</code>, <code>3-minutes</code>, etc). If the measurements do not have a regular
        temporal spacing, use the term <code>irregular</code> to fill out this field.
        <code>var_temporal_res</code> will be visible in the Simons CMAP catalog. This field is populated via a
        dropdown menu. If a value you would like to use is missing from the
        dropdown menu please contact us at{' '}
        <GuideLink href="mailto:cmap-data-submission@uw.edu">
          cmap-data-submission@uw.edu
        </GuideLink>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      constraints: ['Less than 50 characters'],
      example: 'irregular'
    },
  },
  {
    label: 'var_discipline',
    anchorEnd: 'var_discipline',
    text: [
      <React.Fragment key="1">
        Entries in this column specify the discipline(s), such as Physics, Biology, etc, in which a variable is commonly studied. If you list multiple disciplines per variable, please separate them by <code>+</code>. This field is populated via a dropdown menu. If a value you would like to use is missing from the dropdown menu please contact us at <GuideLink href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</GuideLink>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      constraints: ['Less than 100 characters'],
      example: 'Physics+BioGeoChemistry'
    },
  },
  {
    label: 'visualize',
    anchorEnd: 'visualize',
    text: [
      <span key="1">This is a flag field and can only be <code>0</code> (not visualizable) or a <code>1</code> (visualizable). Fill this field with <code>1</code>, if you think this variable can be visualized on a graph. In principle, any variable with numeric values can be visualized while variables with string values, station numbers, or quality flags may not be the best candidates for visualization in CMAP. Please consult with the data curation team if you have any questions.</span>,
    ],
    meta: {
      required: true,
      type: 'Boolean',
      example: <code>1</code>
    }
  },
  {
    label: 'var_keywords',
    text: [
      <span key="1">Every variable in CMAP is annotated with a range of semantically related keywords to ensure a variable can be easily discovered. For example, use of keywords allows you to search using the term “PO4” and retrieve a list of all phosphate data even if “PO4” was not used as name for a given dataset. Similarly, if one searches for “MIT”, CMAP returns all variables generated by MIT groups, or if one looks for “model”, only model outputs are returned. These “semantic” searches are made possible using the keywords that are added to each variable. Keywords should include the attributes described below.</span>,
                                                                                                                                                     <span key="9">Please note that there is no limit to the number of keywords used for a variable. Keywords are not mutually exclusive. For example, a CTD temperature measurement made during a cruise can have all of the following keywords: <code>observation</code>, <code>in-situ</code>, <code>cruise</code>, <code>CTD</code>. Keywords are case-insensitive and you may add/remove them at any point (even after data ingestion).</span>,

                                                                                                                                                     ],
    bullets: [
      <span key="2"><code>Alternative names</code>: other official, unofficial, abbreviation, technical (or jargon) names or notations associated with the variable. Examples: <code>Nitrate</code>, <code>NO3</code>, <code>NO_3</code></span>,
      <span key="3"><code>Method and Instrument</code>: Keywords related to the method and instruments used for the variable measurements. Examples: <code>observation</code>, <code>in-situ</code>, <code>model</code>, <code>satellite</code>, <code>remote sensing</code>, <code>cruise</code>, <code>CTD</code>, <code>cytometry</code>, ….</span>,
                                                                                                            <span key="4"><code>Data Producers</code>: Keywords associated with the lead scientist/lab name/institute name. Examples: <code>UW</code>, <code>University of Washington</code>, <code>Virginia Armbrust</code>, <code>Ginger</code></span>,
                                                                                                            <span key="5"><code>Cruise</code>: The official UNOLS/unofficial name(s) of the cruise(s) during which the variable was measured, if applicable. Examples: <code>KOK1606</code>, <code>Gradients_1</code>, <code>diel</code></span>,
                                                                                                            <span key="6"><code>Project name</code>: If your data are in the context of a project, include the project name. Examples: <code>HOT</code>, <code>Darwin</code>, <code>SeaFlow</code></span>,
                                                                                                            <span key="7"><code>Collection Region</code>: Regions and subregions where the data was collected.  Examples: <code>North Atlantic</code>, <code>North Pacific Subtropical Gyre</code>, <code>NPSG</code>, <code>Sargasso Sea</code></span>,
                                                                                                            <span key="8"><code>Organism name</code>: Names of any organisms associated with that variable.</span>,
                                                                                                            ],
    meta: {
      required: true,
    },
  },
  {
    label: 'var_comment',
    anchorEnd: 'var_comment',
    text: [
      <React.Fragment key="1">
        Use this field to communicate any detailed information about this
        particular variable with the users. Examples of a comment could
        include but are not limited to: a description of method(s) used to
        process raw measurements, a specific instrument name or model number,
        a key describing numbered flags, and links to references or protocols
        specific to a particular variable. <code>var_comment</code> is visible in the
        Simons CMAP catalog.
      </React.Fragment>,
    ],
    meta: {
      required: false,
      constraints: ['No length constraints']
    },
    images: [
      {
        src: '/images/var_comment_on_dataset_page.png',
        alt: 'Variable Comments in Catalog',
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
