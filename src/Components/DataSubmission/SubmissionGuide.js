import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Typography, ListItem, List, ListItemText, Grid, Paper, Divider, Link, Table, TableRow, TableHead, TableCell, TableBody } from '@material-ui/core';

import colors from '../../Enums/colors';

const doiProviderList = [
    {link: 'https://zenodo.org/', name: 'Zenodo'},
    {link: 'https://datadryad.org/stash', name: 'Dryad'},
    {link: 'https://figshare.com/', name: 'FigShare'},
    {link: 'https://osf.io/', name: 'Open Science Framework'},
    {link: 'https://dataverse.harvard.edu/', name: 'Harvard Dataverse'},
    {link: 'https://www.nodc.noaa.gov/', name: 'NCEI'},
    {link: 'https://daac.ornl.gov/', name: 'ORNL DAAC'},
    {link: 'https://portal.edirepository.org/nis/home.jsp', name: 'EDI'},
    {link: 'https://www.pangaea.de/', name: 'PANGAEA'},
    {link: 'https://www.seanoe.org/', name: 'SEANOE'},
    {link: 'https://disc.gsfc.nasa.gov/', name: 'NASA Goddard'},
    {link: 'https://nerc.ukri.org/research/sites/data/', name: 'NERC'},
];

const dataSheetProps = [
    {
        label: 'time',
        anchorEnd: 'time',
        text: [
            'This column holds datetime values with the following format: %Y-%m-%dT%H:%M:%S. The date and time sections are separated by a “T” character.',
            'Example: 2010-02-09T18:15:00'
        ],
        bullets: [
            'Year (%Y) is a four-digit value: example 2010',
            'Month (%m) is a two-digit value: example 02 (for Feburary)',
            'Day (%d) is a two-digit value: example 09',
            'Hour (%H) is a two-digit value from 00 to 23: example 18',
            'Minute (%M) is a two-digit value from 00 to 59: example 15',
            'Second (%S) is a two-digit value from 00 to 59: example 00',
            'Time zone: UTC'
        ]
    },
    {
        label: 'lat',
        anchorEnd: 'lat',
        text: ['This column holds the latitude values with the following characteristics:'],
        bullets: [
            'Type: Numeric values from -90 to 90',
            'Format: Decimal (not military grid system)',
            'Unit: degree North'
        ]
    },
    {
        label: 'lon',
        anchorEnd: 'lon',
        text: ['This column holds the longitude values with the following characteristics:'],
        bullets: [
            'Type: Numeric values from -180 to 180',
            'Format: Decimal (not military grid system)',
            'Unit: degree East'
        ]
    },
    {
        label: 'depth',
        anchorEnd: 'depth',
        text: ['This column holds the depth values with the following characteristics:'],
        bullets: [
            'Type: Positive numeric values. It is 0 at surface with increased values with depth.',
            'Format: Decimal',
            'Unit: meter',
        ]
    },
    {
        label: <React.Fragment>var<sub>1</sub>...var<sub>n</sub></React.Fragment>,
        anchorEnd: 'var',
        text: [
            <React.Fragment>
                These columns represent the dataset variables (measurements). Please rename them to names appropriate for your data.
                Note that these names should be identical to the names defined as <Link href='#data-structure-var_short_name'>var_short_name</Link> 
                &nbsp;in the <Link href='#data-structure-variable'>Variable Metadata</Link> sheet. Please do not include units in these columns; 
                units are recorded in the Variable Metadata sheet. Leave a given cell empty for those instances when data was not taken and a value 
                is missing. Do not replace the missing data with arbitrary values such as “99999”, “0”, “UNKNOWN”, etc. Please review the example 
                datasets in the <Link href='#resources'>resources</Link> section for more information.
            </React.Fragment>
        ],
        bullets: []
    },

];

const datasetMetadataSheetProps = [
    {
        label: 'dataset_short_name',
        anchorEnd: 'dataset_short_name',
        text: ['This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers, and underscores (the first character can not be a number). Do not use space, dash, or special characters such as <, +, %, etc.'],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters'
        ],
        images: []
    },
    {
        label: 'dataset_long_name',
        anchorEnd: 'dataset_long_name',
        text: [
            <React.Fragment>
                A descriptive and human-readable name for the dataset. This name will identify your dataset in the CMAP 
                catalog (<Link href='#fig-1'>Fig.1</Link>) and visualization search dialog (<Link href='#fig-2'>Fig.2</Link>). 
                Any Unicode character can be used here, but please avoid names longer than 200 characters as they may get 
                trimmed when displayed on graphical interfaces. A full textual description of your dataset, with no length limits, 
                is entered in “<Link href='#data-structure-dataset_description'>dataset_description</Link>”. If your dataset is 
                associated with a cruise, we recommend including the official cruise and and the cruise nickname in the
                dataset_long_name. For example: Underway CTD Gradients 3 KM1906.
            </React.Fragment>
            ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 200 characters'
        ],
        images: [            
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_long_name_cat.png',
                alt: 'Dataset Long_name in Catalog',
                caption: 'Figure 1. A sample dataset shown in the Simons CMAP catalog. The "dataset_long_name" is enclosed in the red rectangle.',
                id: 'fig-1'
            },
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_long_name_viz_search.png',
                alt: 'Dataset Long_name in Visualization Page',
                caption: 'Figure 2. The "dataset_long_name" appears in the visualization page search dialog.',
                id: 'fig-2'
            },
        ]
    },
    {
        label: 'dataset_version',
        anchorEnd: 'dataset_version',
        text: ['Please assign a version number or an identifier to your dataset such as “1.0.0” or “Final”. Version identifiers will help track the evolution of a dataset over time.'],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters',
            'Example: 1.0'
        ],
        images: []
    },
    {
        label: 'dataset_release_date',
        anchorEnd: 'dataset_release_date',
        text: ['Indicates the release date of the dataset. If your dataset has been previously published or released publicly, please specify that date. Otherwise, use the date the dataset was submitted to CMAP.'],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters',
            'Example: 2020-06-22'
        ],
        images: []
    },
    {
        label: 'dataset_make',
        anchorEnd: 'dataset_make',
        text: ['This is a required field that provides a broad category description of how a dataset was produced (also referred to as dataset make). Each dataset requires a single descriptor from a fixed set of options (observation, model, assimilation, laboratory), which are described below. This field will help in discovery of data in CMAP by categorizing datasets according to their Make class. Please contact us if you believe your dataset Make is not consistent with any of the categories below:'],
        bullets: [
            'Observation: refers to any in-situ or remote sensing measurements such as measurements made during a cruise expedition, data from an in-situ sensor, or satellite observations. Observations made as part of laboratory experiments have their own distinct category and do not fall in this category.',
            'Model: refers to the outputs of numerical simulations.',
            'Assimilation: refers to products that are a blend of observations and numerical models.',
            'Laboratory: refers to the observations made in a laboratory setting such as culture experiment results.'
        ],
        images: []
    },
    {
        label: 'dataset_source',
        anchorEnd: 'dataset_source',
        text: [
            <React.Fragment>
                Specifies the group and/or the institute name of the data owner(s). It can also include any link (such as a website) to 
                the data producers. This information will be visible in the CMAP catalog as shown in <Link href='#fig-3'>Fig 3</Link>. 
                Also, dataset_source will be annotated to any visualization made using the dataset (<Link href='#fig-4'>Fig. 4</Link>).
            </React.Fragment>
            ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 100 characters',
            'Example: Armbrust Lab, University of Washington'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_source_cat.png',
                alt: 'Dataset Source in Catalog',
                caption: 'Figure 3. A sample dataset shown in the Simons CMAP catalog. The "dataset_source" is enclosed in the red rectangle.',
                id: 'fig-3'
            },
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_source_viz.png',
                alt: 'Dataset Source in Visualizations"',
                caption: 'Figure 4. The "dataset_source" appears in visualizations made using the corresponding dataset (enclosed in the red rectangle).',
                id: 'fig-4'
            }
        ]
    },
    {
        label: 'dataset_distributor',
        anchorEnd: 'dataset_distributor',
        text: ['If your dataset has already been published by a data distributor provide a link to the data distributor. Otherwise, leave this field empty.'],
        bullets: [
            'Required: No (optional)',
            'Constraint: Less than 100 characters',
            'Example: http://marine.copernicus.eu/'
        ],
        images: []
    },
    {
        label: 'dataset_acknowledgement',
        anchorEnd: 'dataset_acknowledgement',
        text: [
            <React.Fragment>
                Specify how your dataset should be acknowleged. You may mention your funding agency, grant number, or 
                you may ask those that use your data to acknowledge your dataset with a particular statement. Dataset 
                acknowlegment will be visible in the catalog page (<Link href='#fig-5'>Fig. 5</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: No (optional)',
            'Constraint: No length limits'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_ack_cat.png',
                alt: 'Dataset Acknowledgment in Catalog',
                caption: 'Figure 5. A sample dataset shown in the Simons CMAP catalog. The "dataset_acknowledgement" is enclosed in the red rectangle.',
                id: 'fig-5'
            }
        ]
    },
    {
        label: 'dataset_history',
        anchorEnd: 'dataset_history',
        text: ['Use this field if your dataset has evolved over time and you wish to add notes about the history of your dataset. Otherwise, leave this field empty.'],
        bullets: ['Required: No (optional)'],
        images: []
    },
    {
        label: 'dataset_description',
        anchorEnd: 'dataset_description',
        text: [
            <React.Fragment>
                Include any description that you think will help a reader better understand your dataset. This description can 
                include information about data acquisition, processing methods, figures, and links to external content. This 
                field serves as the dataset documentation that is visible in the Simons CMAP catalog (<Link href='#fig-6'>Fig. 6</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: No length limits'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/dataset_description_cat.png',
                alt: 'Dataset description in Catalog',
                caption: 'Figure 6. A sample dataset shown in the Simons CMAP catalog. The "dataset_description" is accessible using the "Dataset Details" button, enclosed in the red rectangle.',
                id: 'fig-6'
            }
        ]
    },
    {
        label: 'dataset_references',
        anchorEnd: 'dataset_references',
        text: ['List any publications or documentation that one may cite in reference to the dataset. If there are more than one reference, please put them in separate cells under the dataset_reference column. Leave this field empty if there are no publications associated with this dataset.'],
        bullets: ['Required: No (optional)'],
        images: []
    },
    {
        label: 'climatology',
        anchorEnd: 'climatology',
        text: ['This is a flag indicating whether the dataset represents a climatological product. If your dataset is a climatological product fill this field with “1”. Otherwise, leave this field blank.'],
        bullets: ['Required: No (optional)'],
        images: []
    },
    {
        label: 'cruise_names',
        anchorEnd: 'cruise_names',
        text: ['If your dataset represents measurements made during a cruise expedition (or expeditions), provide a list of cruise official names here. If your dataset is associated with more than one cruise, please put them in separate cells under the cruise_names column. If the cruises have any nicknames, please include them in the same cell as the official cruise name separated by a comma(s). Leave this field blank if your dataset is not associated with a cruise expedition.'],
        bullets: [
            'Required: No (optional)',
            'Constraint: No length limits',
            'Example: KOK1606, Gradients 1'
        ],
        images: []
    }
];

const variableMetadataSheetProps = [
    {
        label: 'var_short_name',
        anchorEnd: 'var_short_name',
        text: [
            <React.Fragment>
                This name is meant to be used in programming codes and scripts. It should only contain a combination of letters, numbers, 
                and underscores (the first character can not be a number). Do not use space, dash, or special characters such as {'<'}, +, 
                %, etc. Finally, there must be a one-to-one match between the short_names listed here and the variable column names in the 
                “Data” sheet (see <Link href='#data-structure-var'>vars</Link>). var_short_name will be seen in the CMAP catalog 
                (<Link href='#fig-7'>Fig. 7</Link>), and will appear as the title of the generated figures (
                <Link href='#fig-8'>Fig. 8</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/var_short_name_cat.png',
                alt: 'Variable short name in catalog',
                caption: 'Figure 7. A sample dataset shown in the Simons CMAP catalog. The "var_short_name" is highlighted in the red rectangle.',
                id: 'fig-7'
            },
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/viz_short_name.png',
                alt: 'Variable short name in a figure',
                caption: 'Figure 8. A sample figure generated in the Simons CMAP catalog. The "var_short_name" appears as the figure title and is highlighted in the red rectangle.',
                id: 'fig-8'
            }
        ]
    },
    {
        label: 'var_long_name',
        anchorEnd: 'var_long_name',
        text: [
            <React.Fragment>
                A descriptive and human-readable label for the variable in accordance with the CF and COARDS conventions [
                <Link href='#reference-1'>1</Link>, <Link href='#reference-2'>2</Link>, <Link href='#reference-3'>3</Link>]. This 
                name will present your variable in the CMAP catalog (<Link href='#fig-9'>Fig. 9</Link>) and visualization search 
                dialog (<Link href='#fig-10'>Fig. 10</Link>). var_long_name can contain any unicode character, but please avoid names 
                longer than 200 characters as they may get trimmed while displayed on graphical interfaces. Please use&nbsp;
                <Link href='#data-structure-var_comment'>var_comment</Link> if you would like to add a full textual description 
                (with no length limits) for your variable.
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 200 characters'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/var_long_name_cat.png',
                alt: 'Variable long name in catalog',
                caption: 'Figure 9. A sample dataset shown in the Simons CMAP catalog. The "var_long_name" is highlighted in the red rectangle.',
                id: 'fig-9'
            },
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/var_long_name_viz_search.png',
                alt: 'var long name in visualization page',
                caption: 'Figure 10. The "var_long_name" appears in the visualization page search dialog.',
                id: 'fig-10'
            }
        ]
    },
    {
        label: 'var_sensor',
        anchorEnd: 'var_sensor',
        text: ['This is a required field that refers to the instrument used to produce the measurements such as CTD, fluorometer, flow cytometer, sediment trap, etc. If your dataset is the result of a field expedition but you are not sure about the name of the instrument used for the measurements, use the term “in-situ” to fill out this field. If your dataset is the output of a numerical model or a combination of model and observation, use the term “simulation” and “blend”, respectively. This field will significantly help to find and categorize data generated using a similar class of instruments. var_sensor will be visible in the Simons CMAP catalog.'],
        bullets: [],
        images: []
    },
    {
        label: 'var_unit',
        anchorEnd: 'var_unit',
        text: [
            <React.Fragment>
                Specifies variable units, if applicable. Leave this field blank if your variable is unitless (e.g. “station numbers” or “quality 
                flags”). Units may contain unicode characters such as subscripts and superscripts. var_unit will be visible in the Simons CMAP 
                catalog (see <Link href='#fig-9'>Fig. 9</Link>) and in the generated visualizations (see <Link href='#fig-8'>Fig. 8</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: No (optional)',
            'Constraint: Less than 50 characters',
            <React.Fragment>Example: ug L<sup>-1</sup></React.Fragment>
        ],
        images: []
    },
    {
        label: 'var_spatial_res',
        anchorEnd: 'var_spatial_res',
        text: [
            <React.Fragment>
                Specifies the spatial resolution of the variable. Typically, gridded products have uniform spatial spacing (such as 0.25° X 0.25°) 
                while field expeditions do not have a regular spatial resolution. If your variable does not have a regular spatial resolution, 
                use the term “irregular” to fill out this field. Note that if samples are taken at a series of distinct but spatially-non-uniform 
                stations, the spatial resolution is considered irregular. var_spatial_res may contain unicode characters such as degree symbol ( ° ) 
                and will be visible in the Simons CMAP catalog (see <Link href='#fig-9'>Fig. 9</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters',
            'Example: irregular'
        ],
        images: []
    },
    {
        label: 'var_temporal_res',
        anchorEnd: 'var_temporal_res',
        text: [
            <React.Fragment>
                Specifies the temporal resolution of measurements (such as daily, hourly, 3-minutes, etc). If the measurements do not have a 
                regular temporal spacing, use the term “irregular” to fill out this field. var_temporal_res will be visible in the Simons CMAP 
                catalog (see <Link href='#fig-9'>Fig. 9</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 50 characters',
            'Example: irregular'
        ],
        images: []
    },
    {
        label: 'var_discipline',
        anchorEnd: 'var_discipline',
        text: [
            <React.Fragment>
                Indicates in which disciplines (such as Physics, Biology …) this variable is commonly studied. You can specify more than one 
                discipline. If you list multiple disciplines per variable, please separate them by comma. var_discipline will be visible in 
                the Simons CMAP catalog (referred to as “Study Domain” in <Link href='#fig-9'>Fig. 9</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: Yes',
            'Constraint: Less than 100 characters',
            'Example: Physics, BioGeoChemistry'
        ],
        images: []
    },
    {
        label: 'visualize',
        anchorEnd: 'visualize',
        text: ['This is a flag field and can only be 0 or 1. Fill this field with 1, if you think this variable can be visualized on a graph by Simons CMAP. In principle, any variable with numeric values can be visualized while variables with string values, station numbers, or quality flags may not be the best candidates for visualization in CMAP. Please consult with the data curation team if you have any questions.'],
        bullets: ['Required: No'],
        images: []
    },
    {
        label: 'var_keywords',
        anchorEnd: 'var_keywords',
        text: ['Every variable in CMAP is annotated with a range of semantically related keywords to ensure a variable can be easily discovered. For example, use of keywords allows you to search using the term “PO4” and retrieve a list of all phosphate data even if “PO4” was not used as the var_long_name for a given dataset. Similarly, if one searches for “MIT”, CMAP returns all variables generated by MIT groups, or if one looks for “model”, only model outputs are returned. These “semantic” searches are made possible using the keywords that are added to each variable. We would like to have keywords to cover the following areas described below (where applicable). Please note that there is no limit to the number of keywords used for a variable. The keywords are case-insensitive and you may add/remove them at any point (even after data ingestion). This is a required field.'],
        bullets: [
            'Alternative names: other official, unofficial, abbreviation, technical (or jargon) names or notations associated with the variable. Examples: Nitrate, NO3, NO_3',
            'Method and Instrument: Keywords related to the method and instruments used for the variable measurements. Examples: observation, in-situ, model, satellite, remote sensing, cruise, CTD, cytometry, ….',
            'Note these keywords are not mutually exclusive. For example, a CTD temperature measurement made during a cruise can have all of the following keywords: observation, in-situ, cruise, CTD',
            'Data Producers: Keywords associated with the lead scientist/lab name/institute name. Examples: UW, University of Washington, Virginia Armbrust, Ginger',
            'Cruise: The official/unoffical name of the cruise(s) during which the variable was measured, if applicable. Examples: KOK1606, Gradients_1, diel',
            'Project name: If your data are in the context of a project, include the project name. Examples: HOT, Darwin, SeaFlow'
        ],
        images: []
    },
    {
        label: 'var_comment',
        anchorEnd: 'var_comment',
        text: [
            <React.Fragment>
                Use this field to communicate any detailed information about this particular variable with the users. This could include, 
                for example, description of method(s) used to process the raw measurements. var_comment is visible in the Simons CMAP 
                catalog (<Link href='#fig-11'>Fig. 11</Link>).
            </React.Fragment>
        ],
        bullets: [
            'Required: No (optional)',
            'Constraint: No length limits'
        ],
        images: [
            {
                src: 'https://cmap.readthedocs.io/en/latest/_static/data_submission_pics/var_comment_cat.png',
                alt: 'Variable description in Catalog',
                caption: 'Figure 11. A sample dataset shown in the Simons CMAP catalog. The "var_commentn" is accessible using the "Comment" button, highlighted in the red rectangle.',
                id: 'fig-11'
            }
        ]
    }
];

const styles = (theme) => ({
    stickyPaper: {
        position: '-webkit-sticky',
        maxHeight: 'calc(100vh - 128px)',
        position: 'sticky',
        top: '90px',
        width: '200px',
        marginLeft: '20px',
        paddingLeft: '12px',
        backgroundColor: 'rgba(0,0,0,.4)',
        overflow: 'auto'
    },

    guideSection: {
        width: '90%',
        // height: '2000px',
        margin: '20px auto 0 auto',
        textAlign: 'left',
        padding: '12px 32px',
        fontFamily: '"roboto", Serif',
        maxWidth: '800px',
        backgroundColor: 'rgba(0,0,0,.4)',
        marginBottom: '20px'
    },

    sectionHeader: {
        margin: '8px 0',
        fontWeight: 100,
        fontFamily: '"roboto", Serif', 
    },

    '@media screen and (max-width: 1300px)': {
        stickyPaper: {
          display: 'none',
        },
    },

    navListItem: {
        color: theme.palette.primary.main,
        padding: '2px 10px 2px 6px'
    },

    navListItemText: {
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    doiListItem: {
        color: theme.palette.primary.main,
        padding: '0 10px 0 6px',
        width: 'max-content'
    },

    doiListItemText: {
        fontSize: '16px',
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    doiListItemtextWrapper: {
        margin: '0'
    },

    navListItemtextWrapper: {
        margin: '2px 0'
    },

    subListText: {
        margin: 0,
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    anchor: {
        display: 'block',
        position: 'relative',
        top: '-120px',
        visibility: 'hidden'
    },

    divider: {
        backgroundColor: theme.palette.primary.main,
        marginBottom: '8px'
    },

    sampleTableRow: {
        border: '1px solid black'
    },

    navListSubItemText: {
        fontSize: '.785rem'
    },

    navListSubSubItemText: {
        fontSize: '.7rem'
    }
})
// toggle display from none to block
const SubmissionGuide = (props) => {
    const { classes } = props;

    const [ activeSection, setActiveSection ] = React.useState(null);

    React.useEffect(() => {
        let onThreshold = (entries) => {
            entries.forEach(e => {
                if(e.isIntersecting && e.target.id !== activeSection) setActiveSection(e.target.id);
            })
        }
        let observer = new IntersectionObserver(onThreshold, {threshold: .5});
        [
            document.querySelector('#data-structure-time'),
            document.querySelector('#data-structure-dataset_short_name'),
            document.querySelector('#data-structure-var_short_name')
        ].forEach(e => observer.observe(e));

        return (() => observer.disconnect());
    });

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={2}>
                    <Paper className={classes.stickyPaper} elevation={6}>
                        <List dense={true}>
                            <ListItem component='a' href='#getting-started' className={classes.navListItem}>
                                <ListItemText
                                    primary="Getting Started"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#submission-process' className={classes.navListItem}>
                                <ListItemText
                                    primary="Submission Process"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <List dense={true} style={{padding: '0 0 0 12px'}}>
                                <ListItem component='a' href='#validation' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Validation"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#feedback' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Feedback"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#doi' className={classes.navListItem}>
                                    <ListItemText
                                        primary="DOI"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#ingestion' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Ingestion"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>
                            </List>

                            <ListItem component='a' href='#dashboard' className={classes.navListItem}>
                                <ListItemText
                                    primary="User Dashboard"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#data-structure' className={classes.navListItem}>
                                <ListItemText
                                    primary="Data Structure"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <List dense={true} style={{padding: '0 0 0 12px'}}>
                                <ListItem component='a' href='#data-structure-data' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Data"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <List dense={true} style={{padding: '0 0 0 12px', display: activeSection === 'data-structure-time' ? 'block' : 'none'}}>
                                    {
                                        dataSheetProps.map((e, i) => (
                                            <ListItem component='a' href={`#data-structure-${e.anchorEnd}`} className={classes.navListItem} key={i}>
                                                <ListItemText                                                    
                                                    primary={e.label}
                                                    className={classes.subListText}
                                                    classes={{primary: classes.navListSubItemText}}
                                                />
                                            </ListItem>
                                        ))
                                    }
                                </List>

                                <ListItem component='a' href='#data-structure-dataset_short_name' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Dataset Metadata"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <List dense={true} style={{padding: '0 0 0 12px', display: activeSection === 'data-structure-dataset_short_name' ? 'block' : 'none'}}>
                                    {
                                        datasetMetadataSheetProps.map((e, i) => (
                                            <ListItem component='a' href={`#data-structure-${e.anchorEnd}`} className={classes.navListItem} key={i}>
                                                <ListItemText                                                    
                                                    primary={e.label}
                                                    className={classes.subListText}
                                                    classes={{primary: classes.navListSubItemText}}
                                                />
                                            </ListItem>
                                        ))
                                    }
                                </List>

                                <ListItem component='a' href='#data-structure-variable' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Variable Metadata"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>

                                <List dense={true} style={{padding: '0 0 0 12px', display: activeSection === 'data-structure-var_short_name' ? 'block' : 'none'}}>
                                    {
                                        variableMetadataSheetProps.map((e, i) => (
                                            <ListItem component='a' href={`#data-structure-${e.anchorEnd}`} className={classes.navListItem} key={i}>
                                                <ListItemText                                                    
                                                    primary={e.label}
                                                    className={classes.subListText}
                                                    classes={{primary: classes.navListSubItemText}}
                                                />
                                            </ListItem>
                                        ))
                                    }
                                </List>

                                <ListItem component='a' href='#data-structure-references' className={classes.navListItem}>
                                    <ListItemText
                                        primary="References"
                                        className={classes.subListText}
                                        classes={{primary: classes.navListSubItemText}}
                                    />
                                </ListItem>
                            </List>

                            <ListItem component='a' href='#faq' className={classes.navListItem}>
                                <ListItemText
                                    primary="FAQ &amp; Help"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <List dense={true} style={{padding: '0 0 0 12px'}}>
                                <ListItem component='a' href='#faq-doi' className={classes.navListItem}>
                                    <ListItemText
                                        primary="DOIs"
                                        className={classes.subListText}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#faq-curation' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Curation"
                                        className={classes.subListText}
                                    />
                                </ListItem>

                                <ListItem component='a' href='#faq-validation-warnings' className={classes.navListItem}>
                                    <ListItemText
                                        primary="Validation Warnings"
                                        className={classes.subListText}
                                    />
                                </ListItem>
                            </List>

                            <ListItem component='a' href='#contact' className={classes.navListItem}>
                                <ListItemText
                                    primary="Contact"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>

                            <ListItem component='a' href='#resources' className={classes.navListItem}>
                                <ListItemText
                                    primary="Resources"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={8}>
                    <Paper className={classes.guideSection} elevation={4}>
                        <Typography variant='h3' className={classes.sectionHeader}>
                            <a className={classes.anchor} id='getting-started'></a>
                            Getting Started
                        </Typography>

                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            Data submitted to <span style={{fontWeight: 600}}>Simons Collaborative Marine Atlas Project</span> must be precisely formatted to maintain
                            high levels of <em>discoverability</em>, <em>comparability</em>, and <em>database performance</em>. 
                        </Typography>
                        
                        <Typography style={{marginTop: '16px'}}>
                            The purpose of the data submission toolset is to provide automatic, immediate feedback to assist you in formatting your 
                            submission, facilitate communication with the data curation team, and allow you to track the progress of your submission.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='submission-process'></a>
                            The Submission Process
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            Begin the process by downloading and populating a&nbsp;
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx' download='datasetTemplate.xlsx'>
                                blank xlsx template.
                            </Link>
                            &nbsp;Completed sample templates can be found in the&nbsp;
                            <Link href='#resources'>resources section</Link>.
                            Details on the requirements and structure can be found in the&nbsp;
                            <Link href='#data-structure'>Data Structure</Link> section.
                        </Typography>

                        <Typography style={{marginTop: '16px'}}>
                            Please note that xlsx workbooks over 150MB <em>cannot be processed</em> using the web submission tools. If you would like to submit
                            a dataset that exceeds this limit please contact the data curation team at <a style={{color:colors.primary, textDecoration: 'none'}} href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Validation
                            <a className={classes.anchor} id='validation'></a>
                        </Typography>

                        <Typography>
                            Load your workbook into the&nbsp;
                            <Link target='_blank' href='/datasubmission/validationtool'>submission tool</Link>
                            &nbsp;to begin validation. The tool will walk you through a step-by-step
                            process to identify and resolve any potential data or format issues.
                            Once the workbook has been validated it will be uploaded to a staging 
                            area to be reviewed by our data curation team. From this point you'll be able to track
                            the progress of your submission in the&nbsp;
                            <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Feedback
                            <a className={classes.anchor} id='feedback'></a>
                        </Typography>

                        <Typography>
                            The data curation team may have suggestions for additional changes to the workbook.
                            Any feedback will be sent to you via email notification, and visible in the&nbsp;
                            <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            DOI
                            <a className={classes.anchor} id='doi'></a>
                        </Typography>

                        <Typography>
                            Once your submission has been approved the data curation team will request a DOI
                            for the data. Information on DOIs can be found in the&nbsp;
                            <Link href='#faq-doi'>
                                DOI Help Section
                            </Link>.
                            The DOI can be submitted using the messaging feature of the <Link href='#dashboard'>user dashboard</Link>.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Ingestion
                            <a className={classes.anchor} id='ingestion'></a>
                        </Typography>

                        <Typography>
                            Once a DOI has been submitted your data will be ingested into the CMAP database. After ingestion,
                            you'll be able to view your dataset in the <Link href='/catalog' target="_blank">data catalog</Link>, and
                            access it through the CMAP API using any of the CMAP&nbsp;
                            <Link href='https://cmap.readthedocs.io/en/latest/user_guide/API_ref/api_ref.html' target="_blank">software packages</Link>.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='dashboard'></a>
                            User Dashboard
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            In the&nbsp;
                            <Link href='/datasubmission/userdashboard' target="_blank">user dashboard</Link>&nbsp;
                            you can track the ingestion process for any dataset that you've submitted,
                            send messages to the data curation team, and download the most recently submitted version of the workbook.
                            Additionally, in the event that the curation team requests additional changes to your submission you can 
                            load the most recent version directly into the validation tool, make any necessary changes, and resubmit.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='data-structure'></a>
                            Data Structure
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            The CMAP data template consists of three sheets: data, dataset metadata, and variable metadata. Data is stored 
                            in the first sheet called “data”. Metadata that describes the dataset is entered in the second 
                            sheet called “dataset_meta_data”. Metadata associated with the variables in the dataset are entered in the third 
                            sheet called “vars_meta_data”. Information must be provided for all columns except those specifically noted as 
                            optional. The data and metadata field names (e.g. time, lat, lon, short_name, long_name, ...) used in the template 
                            file are based on the CF and COARDS naming conventions [
                                <Link href='#reference-1'>1</Link>,&nbsp;
                                <Link href='#reference-2'>2</Link>,&nbsp;
                                <Link href='#reference-3'>3</Link>
                            ].
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Data
                            <a className={classes.anchor} id='data-structure-data'></a>
                        </Typography>

                        <Table size='small' style={{marginBottom: '12px'}}>
                            <TableHead>
                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell>
                                        time
                                    </TableCell>
                                    <TableCell>
                                        lat
                                    </TableCell>
                                    <TableCell>
                                        lon
                                    </TableCell>
                                    <TableCell>
                                        depth[if exists]
                                    </TableCell>
                                    <TableCell>
                                        var<sub>1</sub>
                                    </TableCell>
                                    <TableCell>
                                        ...
                                    </TableCell>
                                    <TableCell>
                                        var<sub>n</sub>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell>
                                        2016-5-01T15:02:00
                                    </TableCell>
                                    <TableCell>
                                        25
                                    </TableCell>
                                    <TableCell>
                                        -158
                                    </TableCell>
                                    <TableCell>
                                        5
                                    </TableCell>
                                    <TableCell>
                                        value
                                    </TableCell>
                                    <TableCell>
                                        ...
                                    </TableCell>
                                    <TableCell>
                                        value
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <Typography>
                            All data points are stored in the “Data” sheet. Each data point must have time and location information. The 
                            exact name and order of the time and location columns are shown in the table above. If a dataset does not have 
                            depth values (e.g., sea surface measurements), you may remove the depth column. If your dataset represents 
                            results of a Laboratory study (see dataset_make) fill these fields with the time of study and the location of 
                            your laboratory. The columns var<sub>1</sub>...var<sub>n</sub> represent the dataset variables (measurements). Please 
                            rename var<sub>1</sub>...var<sub>n</sub> to names appropriate to your data. The format of “time”, “lat”, “lon”, and 
                            “depth” columns are described in the following sections. Please review the example datasets listed under&nbsp;
                            <Link href='#resources'>resources</Link> for more detailed information.
                        </Typography>

                        {dataSheetProps.map((e, i) => (
                            <React.Fragment key={i}>
                                <Typography variant='h6' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                                    {e.label}
                                    <a className={classes.anchor} id={`data-structure-${e.anchorEnd}`}></a>
                                </Typography>
                                {e.text.map((text, j) => (
                                    <Typography key={i + j * 100}>
                                        {text}                           
                                    </Typography>
                                ))}
                                <ul>
                                    {e.bullets.map((bullet, k) => (
                                        <li key={k + i * 1000}>{bullet}</li>
                                    ))}
                                </ul>
                            </React.Fragment>
                        ))}

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Dataset Metadata
                            <a className={classes.anchor} id='data-structure-dataset'></a>
                        </Typography>

                        <Typography>
                            This sheet holds a list of top-level attributes about the dataset such as the dataset name and description. 
                            Below are the list of these attributes along with their descriptions. Please review the example datasets listed 
                            under <Link href='#resources'>resources</Link> for more detailed information.
                        </Typography>

                        {datasetMetadataSheetProps.map((e, i) => (
                            <React.Fragment key={i}>
                                <Typography variant='h6' className={classes.sectionHeader} style={{marginTop: '50px'}} key={i}>
                                    {e.label}
                                    <a className={classes.anchor} id={`data-structure-${e.anchorEnd}`}></a>
                                </Typography>
                                {e.text.map((text, j) => (
                                    <Typography key={j + i * 10}>
                                        {text}                           
                                    </Typography>
                                ))}
                                <ul>
                                    {e.bullets.map((bullet, k) => (
                                        <li key={k + i * 100}>{bullet}</li>
                                    ))}
                                </ul>
                                {e.images.map((image, l) => (
                                    <figure key={l + i * 1000} style={{margin: '30px 0 0 0'}}>
                                        <a className={classes.anchor} id={image.id}></a>
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            width='100%'
                                            style={{maxwidth: '100%'}}                                            
                                        />
                                        <figcaption>
                                            {image.caption}
                                        </figcaption>
                                    </figure>
                                ))

                                }
                            </React.Fragment>
                        ))}

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Variable Metadata
                            <a className={classes.anchor} id='data-structure-variable'></a>
                        </Typography>

                        <Typography>
                            A dataset can contain multiple different measurements (variables). This sheet (labeled as "vars_meta_data") 
                            holds a list of top-level attributes about these variables such as the variable name, unit, and description. 
                            Each variable along with its attributes (metadata) is stored in separate rows. Below is the list of these 
                            attributes along with their descriptions. Please review the example datasets listed in the&nbsp;
                            <Link href='#resources'>resources</Link> section for more information.
                        </Typography>

                        {variableMetadataSheetProps.map((e, i) => (
                            <React.Fragment key={i}>
                                <Typography variant='h6' className={classes.sectionHeader} style={{marginTop: '50px'}} key={i}>
                                    {e.label}
                                    <a className={classes.anchor} id={`data-structure-${e.anchorEnd}`}></a>
                                </Typography>
                                {e.text.map((text, j) => (
                                    <Typography key={j + i * 10}>
                                        {text}                           
                                    </Typography>
                                ))}
                                <ul>
                                    {e.bullets.map((bullet, k) => (
                                        <li key={k + i * 100}>{bullet}</li>
                                    ))}
                                </ul>
                                {e.images.map((image, l) => (
                                    <figure key={l + i * 1000} style={{margin: '30px 0 0 0'}}>
                                        <a className={classes.anchor} id={image.id}></a>
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            width='100%'
                                            style={{maxwidth: '100%'}}                                            
                                        />
                                        <figcaption>
                                            {image.caption}
                                        </figcaption>
                                    </figure>
                                ))

                                }
                            </React.Fragment>
                        ))}

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            References
                            <a className={classes.anchor} id='data-structure-references'></a>
                        </Typography>

                        <Typography>
                            <a className={classes.anchor} id='reference-1'></a>
                            <Link href='http://cfconventions.org/cf-conventions/cf-conventions.html' target='_blank'>
                                NetCDF Climate and Forecast (CF) Metadata Conventions
                            </Link>
                        </Typography>

                        <Typography>
                            <a className={classes.anchor} id='reference-2'></a>
                            <Link href='https://ferret.pmel.noaa.gov/noaa_coop/coop_cdf_profile.html' target='_blank'>
                                Conventions for the standardization of NetCDF files
                            </Link>
                        </Typography>

                        <Typography>
                            <a className={classes.anchor} id='reference-3'></a>
                            <Link href='https://ferret.pmel.noaa.gov/Ferret/documentation/coards-netcdf-conventions' target='_blank'>
                                COARDS NetCDF Conventions
                            </Link>
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='faq'></a>
                            FAQ &amp; Help
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            What is a DOI and how can I get one for my dataset?
                            <a className={classes.anchor} id='faq-doi'></a>
                        </Typography>

                        <Typography>
                            A <em>DOI</em> or <em>Digital Object Identifier</em> is a digital identifier for a dataset. Some DOI providers, such as Zenodo, 
                            allow for dataset version controlling. We require a DOI to be registered for your dataset in the submission process. 
                            It allows for users to cite the use of a dataset and properly acknowledge the dataset creators.
                        </Typography>

                        <Typography style={{marginTop:'24px'}}>
                            Below is a list of entities that may issue and link your dataset to a unique DOI:
                        </Typography>

                        <List>
                            {
                                doiProviderList.map((e, i) => (
                                    <ListItem target='_blank' component='a' href={e.link} className={classes.doiListItem} key={i}>
                                        <ListItemText
                                            primary={e.name}
                                            classes={{primary: classes.doiListItemText}}
                                            className={classes.doiListItemtextWrapper}
                                        />
                                    </ListItem>
                                ))
                            }
                        </List>

                        <Typography style={{margin:'18px 0'}}>
                            See the tutorial video below to learn how to obtain a DOI for your dataset using Zenodo.
                        </Typography>

                        <iframe src="https://player.vimeo.com/video/407462463" width="780" height="440" style={{margin:'0 auto'}}></iframe>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            Isn't this automated? Why do I need to wait for feedback from a curator?
                            <a className={classes.anchor} id='faq-curation'></a>
                        </Typography>

                        <Typography>
                            The online validator is designed to catch formatting issues, missing information, and fields which don't meet  
                            CMAP's ingestion requirements. Evaluating the accuracy and descriptiveness of metadata 
                            requires significant domain knowledge and understanding of the CMAP ecosystem, and are best done by a human.
                        </Typography>

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                            What should I do about the validation warnings?
                            <a className={classes.anchor} id='faq-curation'></a>
                        </Typography>

                        <Typography>
                            Validation warnings if present will appear in yellow when you select your workbook in the validation tool, 
                            indicating <em>possible</em> errors in your data or metadata such as outliers, columns with mixed data types, or
                            missing cruise information. They should be reviewed carefully, but if you determine they do not need to be corrected
                            they will not prevent you from moving forward with your submission.
                        </Typography>                

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='contact'></a>
                            Contact
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            You can reach the CMAP data curation team at <a style={{color:colors.primary, textDecoration: 'none'}} href="mailto:cmap-data-submission@uw.edu">cmap-data-submission@uw.edu</a>.
                        </Typography>

                        <Typography variant='h3' className={classes.sectionHeader} style={{marginTop: '80px'}}>
                            <a className={classes.anchor} id='resources'></a>
                            Resources
                        </Typography>
                        <Divider variant='fullWidth' classes={{root: classes.divider}}/>

                        <Typography>
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx' download='datasetTemplate.xlsx'>
                                Download a Blank xlsx Template
                            </Link>
                        </Typography>

                        <Typography>
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/KOK1606_Gradients1_Cobalamin_example_2020_07_15.xlsx' download='KOK1606_Gradients1_Cobalamin_Sample.xlsx'>
                                Sample Dataset - KOK1606_Gradients1_Cobalamin
                            </Link>
                        </Typography>

                        <Typography>
                            <Link href='https://github.com/simonscmap/DBIngest/raw/master/template/amt01_extracted_cholorphyll_2020_07_25.xlsx' download='AMT01_Extracted_Cholorphyll_Sample.xlsx'>
                                Sample Dataset - amt01_extracted_cholorphyll
                            </Link>
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

export default withStyles(styles)(SubmissionGuide);