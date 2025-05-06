import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { GuideLink } from '../Links';

export const dataSheet = [
  {
    label: 'time',
    text: [
      <span key={'1'}>
        This column holds datetime values with the following format:{' '}
        <code>%Y-%m-%dT%H:%M:%S</code>. The date and time sections are separated
        by a “T” character. Example: <code>2010-02-09T18:15:00</code>.
      </span>,
      <span key={'2'}>
        If your data is not in UTC time zone, explicitly specify the time zone
        offset using this format: <code>%Y-%m-%dT%H:%M:%S%z</code>, as in the
        example <code>2024-07-24T21:48:32.485+11:00</code>, otherwise it might
        be interpreted as UTC.
      </span>,
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
      example: '2024-07-24T21:48:32.485Z',
    },
  },
  {
    label: 'lat',
    text: ['This column holds the latitude values.'],
    meta: {
      type: 'Numeric values from -90 to 90',
      format: 'Decimal (not military grid system)',
      unit: 'degree North',
      required: true,
      example: '15.0',
    },
  },
  {
    label: 'lon',
    text: ['This column holds the longitude values.'],
    meta: {
      type: 'Numeric values from -180 to 180',
      format: 'Decimal (not military grid system)',
      unit: 'degree East',
      required: true,
      example: '-75.5',
    },
  },
  {
    label: 'depth',
    text: ['This column holds the depth values.'],
    meta: {
      type: 'Positive numeric values. It is 0 at surface with increased values with depth.',
      format: 'Decimal',
      unit: 'meter',
      required: true,
      example: 10,
    },
  },
  {
    label: 'cruise',
    text: [
      'If your dataset is associated with more than one cruise, please add a cruise column and list the official cruise name corresponding to each row of data. The cruise column enables the CMAP Validation API to cross-check the time and space coordinates for each data point against the appropriate cruise trajectory. If your dataset is associated with only one cruise or is not associated with any cruises, this column is unnecessary.',
    ],
    meta: {
      type: 'Text',
      required: false,
      constraints: ['None'],
    },
  },
];

//

export const metadataSheet = [
  {
    label: 'dataset_short_name',
    text: [
      <span>
        This name is meant to be used in programming codes and scripts. It
        should only contain a combination of letters, numbers, and underscores
        (the first character can not be a number). Do not use space, dash, or
        special characters such as <code>&lt;</code>, <code>+</code>,{' '}
        <code>%</code>, etc.
      </span>,
    ],
    meta: {
      required: true,
      type: 'text',
      constraints: [
        'Less than 50 characters',
        'No spaces or special characters (underscore permitted)',
        'First character may not be a number',
      ],
      example: 'UCYN_A1_nifH_copies_L_1',
    },
  },
  // dataset_long_name has a custom component
  {
    label: 'dataset_version',
    text: [
      'Please assign a version number or an identifier to your dataset such as “1.0.0” or “Final”. Version identifiers will help track the evolution of a dataset over time.',
    ],
    meta: {
      required: true,
      constraints: ['Less than 50 characters'],
      example: '1.0',
    },
  },
  {
    label: 'dataset_release_date',
    text: [
      'Indicates the release date of the dataset. If your dataset has been previously published or released publicly, please specify that date. Otherwise, use the date the dataset was submitted to CMAP.',
    ],
    meta: {
      required: true,
      constraints: ['Less than 50 characters'],
      example: '2020-06-22',
    },
  },
  {
    label: 'dataset_make',
    anchorEnd: 'dataset_make',
    text: [
      'This is a required field that provides a broad category description of how a dataset was produced (also referred to as dataset make). Each dataset requires a single descriptor from a fixed set of options:',
      <div style={{ paddingLeft: '20px' }} key="a">
        <List>
          <ListItem>
            <code>{'observation'}</code>
          </ListItem>
          <ListItem>
            <code>{'model'}</code>
          </ListItem>
          <ListItem>
            <code>{'assimilation'}</code>
          </ListItem>
          <ListItem>
            <code>{'laboratory'}</code>
          </ListItem>
        </List>
      </div>,
      'This field will help in discovery of data in CMAP by categorizing datasets according to their make class. Please contact us if you believe your dataset make is not consistent with any of the categories.',
      <span key="b">
        <code>Obeservation</code> refers to any in-situ or remote sensing
        measurements such as measurements made during a cruise expedition, data
        from an in-situ sensor, or satellite observations. Observations made as
        part of laboratory experiments have their own distinct category and do
        not fall in this category.
      </span>,
      <span key="c">
        <code>Model</code> refers to the outputs of numerical simulations.
      </span>,
      <span key="d">
        <code>Assimilation</code> refers to products that are a blend of
        observations and numerical models.
      </span>,
      <span key="e">
        <code>Laborotory</code> refers to the observations made in a laboratory
        setting such as culture experiment results.
      </span>,
    ],
    meta: {
      required: true,
      type: 'Text',
      constraints: ['Must be one of the four preset options'],
      example: 'observation',
    },
  },
  // dataset_source is a custom component
  {
    label: 'dataset_distributor',
    text: [
      <span key="1">
        If your dataset has already been published by a data distributor provide
        a link to the data distributor. Otherwise, fill this field with the same
        content as the <code>dataset_source</code>.
      </span>,
    ],
    meta: {
      required: false,
      constraints: ['Less than 100 characters'],
      example: 'http://marine.copernicus.eu/',
    },
  },
  {
    label: 'dataset_acknowledgement',
    text: [
      <React.Fragment key="1">
        Please use this field to acknowledge sponsors of and contributors to
        your dataset and indicate to users how they should cite use of your
        dataset. You may mention your funding agency, and grant number, or you
        may ask those that use your data to acknowledge your dataset with a
        particular statement or citation. Dataset acknowledgment will be visible
        in the <GuideLink href="/catalog">Catalog</GuideLink>.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      type: 'Text',
      constraints: ['No length limits'],
      example:
        'Particulate metabolites from MGL1704 (Gradients 2 cruise) were collected and produced by the Ingalls Lab as part of the Simons Gradients project with support from the Simons Foundation.',
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
      constraints: ['No length limits'],
      example:
        'Version 2.0 improves on Version 1.0 by adding the variable ‘chlorophyll a’ (chla)',
    },
  },
  {
    label: 'dataset_description',
    text: [
      <React.Fragment key="1">
        Your description serves as the dataset documentation visible in the
        Simons CMAP catalog and helps users understand your dataset. The
        description should include information about the data that is contained
        in the dataset as well as how and where samples were collected and
        processed. It can also include figures and links to external content. It
        is recommended that the description provide the context of the dataset,
        including a brief overview of any larger sampling program if applicable.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      type: 'Text',
      constraints: ['No length limit'],
      example:
        'The dataset consists of BD Influx-based analysis of phytoplankton populations from discrete flow cytometry data collected during the Gradients 2023 (Gradients 5/TN412) oceanographic research cruise in the equatorial Pacific Ocean. The data consists of cell abundance, cell size (equivalent spherical diameter), carbon quota, and carbon biomass for heterotrophic bacteria, picophytoplankton populations, namely the cyanobacteria Prochlorococcus and Synechococcus, and small eukaryotic phytoplankton (<5 µm ESD). Time is in UTC format, latitude and longitude are in decimal degrees, and depth is in meters. Further information can be found here: https://github.com/fribalet/FCSplankton',
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
    label: 'climatology',
    text: [
      <span key="1">
        This is a flag indicating whether the dataset represents a
        climatological product. If your dataset is a climatological product fill
        this field with <code>1</code>. Otherwise, fill this field with{' '}
        <code>0</code>.
      </span>,
    ],
    meta: {
      required: false,
      type: 'Boolean',
      example: <span>0</span>,
      constraints: ['Must be a 1 or a 0', 'Default: 0'],
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
        special characters such as <code>{'<'}</code>, <code>+</code>,{' '}
        <code>%</code>, etc. Finally, there must be a one-to-one match between
        the short names listed here and the variable column names in the “Data”
        sheet (see <GuideLink href="#var-n-columns">var1 ... varN</GuideLink>).{' '}
        <code>var_short_name</code> will be seen in the CMAP catalog.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      type: 'Text',
      constraints: [
        'Less than 50 characters',
        'No spaces or special characters (underscore permitted)',
        'First character may not be a number',
      ],
      example: 'extracted_chl_a',
    },
    images: [
      {
        src: '/images/guide/var_short_name_web.png',
        alt: 'Variable short name in catalog',
      },
    ],
  },
  {
    label: 'var_long_name',
    text: [
      <React.Fragment key="1">
        A descriptive and human-readable label for the variable in accordance
        with the CF and COARDS conventions. This name will present your variable
        in the CMAP catalog, visualization search dialog, and will appear as the
        title of figures generated on the vizualization page.{' '}
        <code>var_long_name</code> can contain any unicode character, but please
        avoid names longer than 200 characters as they may get trimmed while
        displayed on graphical interfaces. Please use&nbsp;
        <GuideLink href="#var_comment-column">var_comment</GuideLink> if you
        would like to add a full textual description (with no length limits) for
        your variable.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      constraints: ['Less than 200 characters', 'Use title case'],
      example: 'Extracted Chlorophyll A',
    },
    images: [
      {
        src: '/images/guide/var_long_name_catalog.png',
        alt: 'Variable long name in catalog',
      },
      {
        src: '/images/guide/var_long_name_vis.png',
        alt: 'Variable long name on the Visualization Page',
      },
    ],
  },
  {
    label: 'var_sensor', // leave this stub here
    text: [<React.Fragment></React.Fragment>],
  },
  {
    label: 'var_unit',
    text: [
      <React.Fragment>
        Enter the units of each variable in this column. Leave this field blank
        if your variable is unitless (e.g. “station numbers” or “quality
        flags”). Units may contain unicode characters such as subscripts and
        superscripts. <code>var_unit</code> will be visible in the Simons CMAP
        catalog and in the generated visualizations.
      </React.Fragment>,
    ],
    meta: {
      required: false,
      type: 'Text',
      constraints: ['Less than 50 characters'],
      example: 'cells/ml',
    },
  },
  {
    label: 'var_spatial_res',
    anchorEnd: 'var_spatial_res',
    text: [
      <span key="1">
        Entries in this column describe the spatial resolution of the variable.
        Typically, gridded products have uniform spatial spacing (such as{' '}
        <code>0.25° X 0.25°</code>) while field expeditions do not. If your
        variable does not have a regular spatial resolution, use the term{' '}
        <code>irregular</code> to fill out this field. Note that if samples are
        taken at a series of distinct but spatially-non-uniform stations, the
        spatial resolution is considered irregular. <code>var_spatial_res</code>{' '}
        may contain unicode characters such as degree symbol (<code> ° </code>)
        and will be visible in the Simons CMAP catalog. This field is populated
        via a dropdown menu. If a value you would like to use is missing from
        the dropdown menu please contact us at{' '}
        <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink>{' '}
        to request that it be added.
      </span>,
    ],
    meta: {
      required: true,
      type: 'Preset option',
      constraints: ['Less than 50 characters'],
      example: 'irregular',
    },
  },
  {
    label: 'var_temporal_res',
    anchorEnd: 'var_temporal_res',
    text: [
      <React.Fragment>
        Entries in this column describe the temporal resolution (
        <code>daily</code>, <code>hourly</code>, <code>3-minutes</code>, etc).
        If the measurements do not have a regular temporal spacing, use the term{' '}
        <code>irregular</code> to fill out this field.{' '}
        <code>var_temporal_res</code> will be visible in the Simons CMAP
        catalog. This field is populated via a dropdown menu. If a value you
        would like to use is missing from the dropdown menu please contact us at{' '}
        <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      type: 'Preset option',
      constraints: ['Less than 50 characters'],
      example: 'irregular',
    },
  },
  {
    label: 'var_discipline',
    anchorEnd: 'var_discipline',
    text: [
      <React.Fragment key="1">
        Entries in this column specify the discipline(s), such as Physics,
        Biology, etc, in which a variable is commonly studied. If you list
        multiple disciplines per variable, please separate them by{' '}
        <code>+</code>. This field is populated via a dropdown menu. If a value
        you would like to use is missing from the dropdown menu please contact
        us at{' '}
        <GuideLink href="mailto:simonscmap@uw.edu">simonscmap@uw.edu</GuideLink>{' '}
        to request that it be added.
      </React.Fragment>,
    ],
    meta: {
      required: true,
      type: 'Text',
      format: 'Terms separated by "+"',
      constraints: ['Less than 100 characters'],
      example: 'Physics+BioGeoChemistry',
    },
  },
  {
    label: 'visualize',
    anchorEnd: 'visualize',
    text: [
      <span key="1">
        This is a flag field and can only be <code>0</code> (not visualizable)
        or <code>1</code> (visualizable). Fill this field with <code>1</code> if
        you think this variable can be visualized on a graph. In principle, any
        variable with numeric values can be visualized while variables with
        string values, station numbers, or quality flags may not be the best
        candidates for visualization in CMAP. Please consult with the data
        curation team if you have any questions.
      </span>,
    ],
    meta: {
      required: true,
      type: 'Boolean',
      constraints: ['Must be a 1 or a 0'],
      example: <code>1</code>,
    },
  },
  {
    label: 'var_keywords',
    text: [
      <span key="1">
        Every variable in CMAP is annotated with a range of semantically related
        keywords to ensure a variable can be easily discovered. For example, use
        of keywords allows you to search using the term “PO4” and retrieve a
        list of all phosphate data even if “PO4” was not used as name for a
        given dataset. Similarly, if one searches for “MIT”, CMAP returns all
        variables generated by MIT groups, or if one looks for “model”, only
        model outputs are returned. These “semantic” searches are made possible
        using the keywords that are added to each variable. Keywords should
        include the attributes described below.
      </span>,
      <span key="9">
        Please note that there is no limit to the number of keywords used for a
        variable. Keywords are not mutually exclusive. For example, a CTD
        temperature measurement made during a cruise can have all of the
        following keywords: <code>observation</code>, <code>in-situ</code>,{' '}
        <code>cruise</code>, <code>CTD</code>. Keywords are case-insensitive and
        you may add/remove them at any point (even after data ingestion).
      </span>,
    ],
    bullets: [
      <span key="2">
        <code>Alternative names</code>: other official, unofficial,
        abbreviation, technical (or jargon) names or notations associated with
        the variable. Examples: <code>Nitrate</code>, <code>NO3</code>,{' '}
        <code>NO_3</code>
      </span>,
      <span key="3">
        <code>Method and Instrument</code>: Keywords related to the method and
        instruments used for the variable measurements. Examples:{' '}
        <code>observation</code>, <code>in-situ</code>, <code>model</code>,{' '}
        <code>satellite</code>, <code>remote sensing</code>, <code>cruise</code>
        , <code>CTD</code>, <code>cytometry</code>, ….
      </span>,
      <span key="4">
        <code>Data Producers</code>: Keywords associated with the lead
        scientist/lab name/institute name. Examples: <code>UW</code>,{' '}
        <code>University of Washington</code>, <code>Virginia Armbrust</code>,{' '}
        <code>Ginger</code>
      </span>,
      <span key="5">
        <code>Cruise</code>: The official UNOLS/unofficial name(s) of the
        cruise(s) during which the variable was measured, if applicable.
        Examples: <code>KOK1606</code>, <code>Gradients_1</code>,{' '}
        <code>diel</code>
      </span>,
      <span key="6">
        <code>Project name</code>: If your data are in the context of a project,
        include the project name. Examples: <code>HOT</code>,{' '}
        <code>Darwin</code>, <code>SeaFlow</code>
      </span>,
      <span key="7">
        <code>Collection Region</code>: Regions and subregions where the data
        was collected. Examples: <code>North Atlantic</code>,{' '}
        <code>North Pacific Subtropical Gyre</code>, <code>NPSG</code>,{' '}
        <code>Sargasso Sea</code>
      </span>,
      <span key="8">
        <code>Organism name</code>: Names of any organisms associated with that
        variable.
      </span>,
    ],
    meta: {
      required: true,
      type: 'Text',
      constraints: ['Separate terms with a comma'],
      example:
        'Atlantic Meridional Transect, AMT01, JR19950921, British Oceanographic Data Centre, BODC, fluorometer, extracted chlorophyll a, chlorophyll, biology, cruise, in-situ, insitu, atlantic ocean',
    },
  },
  {
    label: 'var_comment',
    anchorEnd: 'var_comment',
    text: [
      <React.Fragment key="1">
        Use this field to communicate any detailed information about this
        particular variable with the users. Examples of a comment could include
        but are not limited to: a description of method(s) used to process raw
        measurements, a specific instrument name or model number, a key
        describing numbered flags, and links to references or protocols specific
        to a particular variable. <code>var_comment</code> is visible in the
        Simons CMAP catalog.
      </React.Fragment>,
    ],
    meta: {
      required: false,
      constraints: ['No length constraints'],
      example:
        'Value of 1 indicates that the carbon fixation rate was below detection levels.',
    },
    images: [
      {
        src: '/images/guide/comment_web.png',
        alt: 'Variable Comments in Catalog',
      },
    ],
  },
];

// export a map from id to data

export const map = new Map();
// Data Sheet
map.set('time-column', dataSheet[0]);
map.set('lat-column', dataSheet[1]);
map.set('lon-column', dataSheet[2]);
map.set('depth-column', dataSheet[3]);
map.set('cruise-column', dataSheet[4]);

// Metadata Sheet
map.set('dataset_short_name', metadataSheet[0]);
// map.set ('dataset_long_name-column', metadataSheet[1]); // this is now a custom component
map.set('dataset_version-column', metadataSheet[1]);
map.set('dataset_release_date-column', metadataSheet[2]);
map.set('dataset_make-column', metadataSheet[3]);
// map.set ('dataset_source-column', metadataSheet[4]); // this is now a custom component
map.set('dataset_distributor-column', metadataSheet[4]);
map.set('dataset_acknowledgment-column', metadataSheet[5]);
map.set('dataset_history-column', metadataSheet[6]);
map.set('dataset_description-column', metadataSheet[7]);
// map.set ('dataset_references-column', metadataSheet[8]);
map.set('climatology-column', metadataSheet[8]);
// map.set ('cruise_names-column', metadataSheet[10]);

// Variable Metadata Sheet
map.set('var_short_name-column', variableMetadataSheet[0]);
map.set('var_long_name-column', variableMetadataSheet[1]);
// map.set ('var_sensor-column', variableMetadataSheet[2]);
map.set('var_unit-column', variableMetadataSheet[3]);
map.set('var_spatial_res-column', variableMetadataSheet[4]);
map.set('var_temporal_res-column', variableMetadataSheet[5]);
map.set('var_discipline-column', variableMetadataSheet[6]);
map.set('visualize-column', variableMetadataSheet[7]);
map.set('var_keywords-column', variableMetadataSheet[8]);
map.set('var_comment-column', variableMetadataSheet[9]);
