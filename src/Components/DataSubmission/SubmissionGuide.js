import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import {
  Typography,
  ListItem,
  List,
  ListItemText,
  Grid,
  Paper,
  Divider,
  Link,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@material-ui/core';

import DSGuideItem from './DSGuideItem';

import colors from '../../enums/colors';
import dsGuideItems from '../../Utility/DataSubmission/dsGuideItems';

const doiProviderList = [
  { link: 'https://zenodo.org/', name: 'Zenodo' },
  { link: 'https://datadryad.org/stash', name: 'Dryad' },
  { link: 'https://figshare.com/', name: 'FigShare' },
  { link: 'https://osf.io/', name: 'Open Science Framework' },
  { link: 'https://dataverse.harvard.edu/', name: 'Harvard Dataverse' },
  { link: 'https://www.nodc.noaa.gov/', name: 'NCEI' },
  { link: 'https://daac.ornl.gov/', name: 'ORNL DAAC' },
  { link: 'https://portal.edirepository.org/nis/home.jsp', name: 'EDI' },
  { link: 'https://www.pangaea.de/', name: 'PANGAEA' },
  { link: 'https://www.seanoe.org/', name: 'SEANOE' },
  { link: 'https://disc.gsfc.nasa.gov/', name: 'NASA Goddard' },
  { link: 'https://nerc.ukri.org/research/sites/data/', name: 'NERC' },
];

const NavListItem = ({ item, classes }) => (
  <ListItem
    component="a"
    href={`#data-structure-${item.anchorEnd}`}
    className={classes.navListItem}
  >
    <ListItemText
      primary={item.label}
      className={classes.subListText}
      classes={{ primary: classes.navListSubItemText }}
    />
  </ListItem>
);

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
    overflow: 'auto',
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
    marginBottom: '20px',
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
    padding: '2px 10px 2px 6px',
  },

  navListItemText: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  doiListItem: {
    color: theme.palette.primary.main,
    padding: '0 10px 0 6px',
    width: 'max-content',
  },

  doiListItemText: {
    fontSize: '16px',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  doiListItemtextWrapper: {
    margin: '0',
  },

  navListItemtextWrapper: {
    margin: '2px 0',
  },

  subListText: {
    margin: 0,
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  anchor: {
    display: 'block',
    position: 'relative',
    top: '-120px',
    visibility: 'hidden',
  },

  divider: {
    backgroundColor: theme.palette.primary.main,
    marginBottom: '8px',
  },

  sampleTableRow: {
    border: '1px solid black',
  },

  navListSubItemText: {
    fontSize: '.785rem',
  },

  navListSubSubItemText: {
    fontSize: '.7rem',
  },

  bodyListItem: {
    padding: '0px 0px 0px 28px',
  },
});
// toggle display from none to block
const SubmissionGuide = (props) => {
  const { classes } = props;

  const [activeSection, setActiveSection] = React.useState(null);

  React.useEffect(() => {
    let onThreshold = (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.target.id !== activeSection) {
          setActiveSection(e.target.id);
        }
      });
    };
    let observer = new IntersectionObserver(onThreshold, { threshold: 0.5 });
    [
      document.querySelector('#data-structure-time'),
      document.querySelector('#data-structure-dataset_short_name'),
      document.querySelector('#data-structure-var_short_name'),
    ].forEach((e) => observer.observe(e));

    return () => observer.disconnect();
  });

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={2}>
          <Paper className={classes.stickyPaper} elevation={6}>
            <List dense={true}>
              <ListItem
                component="a"
                href="#getting-started"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="Getting Started"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <ListItem
                component="a"
                href="#submission-process"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="Submission Process"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <List dense={true} style={{ padding: '0 0 0 12px' }}>
                <ListItem
                  component="a"
                  href="#validation"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Validation"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#feedback"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Feedback"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#doi"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="DOI"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#ingestion"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Ingestion"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>
              </List>

              <ListItem
                component="a"
                href="#dashboard"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="User Dashboard"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <ListItem
                component="a"
                href="#data-structure"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="Data Structure"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <List dense={true} style={{ padding: '0 0 0 12px' }}>
                <ListItem
                  component="a"
                  href="#data-structure-data"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Data"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <List
                  dense={true}
                  style={{
                    padding: '0 0 0 12px',
                    display:
                      activeSection === 'data-structure-time'
                        ? 'block'
                        : 'none',
                  }}
                >
                  {dsGuideItems.dataItems.map((e, i) => (
                    <NavListItem item={e} key={i} classes={classes} />
                  ))}
                </List>

                <ListItem
                  component="a"
                  href="#data-structure-dataset_short_name"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Dataset Metadata"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <List
                  dense={true}
                  style={{
                    padding: '0 0 0 12px',
                    display:
                      activeSection === 'data-structure-dataset_short_name'
                        ? 'block'
                        : 'none',
                  }}
                >
                  {dsGuideItems.datasetMetadataItems.map((e, i) => (
                    <NavListItem item={e} key={i} classes={classes} />
                  ))}
                </List>

                <ListItem
                  component="a"
                  href="#data-structure-variable"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Variable Metadata"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>

                <List
                  dense={true}
                  style={{
                    padding: '0 0 0 12px',
                    display:
                      activeSection === 'data-structure-var_short_name'
                        ? 'block'
                        : 'none',
                  }}
                >
                  {dsGuideItems.variableMetadataItems.map((e, i) => (
                    <NavListItem item={e} key={i} classes={classes} />
                  ))}
                </List>

                <ListItem
                  component="a"
                  href="#data-structure-references"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="References"
                    className={classes.subListText}
                    classes={{ primary: classes.navListSubItemText }}
                  />
                </ListItem>
              </List>

              <ListItem
                component="a"
                href="#faq"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="FAQ &amp; Help"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <List dense={true} style={{ padding: '0 0 0 12px' }}>
                <ListItem
                  component="a"
                  href="#faq-doi"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="DOIs"
                    className={classes.subListText}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#faq-curation"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Curation"
                    className={classes.subListText}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#faq-validation-warnings"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Validation Warnings"
                    className={classes.subListText}
                  />
                </ListItem>

                <ListItem
                  component="a"
                  href="#faq-preliminary"
                  className={classes.navListItem}
                >
                  <ListItemText
                    primary="Preliminary Datasets"
                    className={classes.subListText}
                  />
                </ListItem>
              </List>

              <ListItem
                component="a"
                href="#contact"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="Contact"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>

              <ListItem
                component="a"
                href="#resources"
                className={classes.navListItem}
              >
                <ListItemText
                  primary="Resources"
                  classes={{ primary: classes.navListItemText }}
                  className={classes.navListItemtextWrapper}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={8}>
          <Paper className={classes.guideSection} elevation={4}>
            <Typography variant="h3" className={classes.sectionHeader}>
              <a className={classes.anchor} id="getting-started"></a>
              Getting Started
            </Typography>

            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              Data submitted to{' '}
              <span style={{ fontWeight: 600 }}>
                Simons Collaborative Marine Atlas Project
              </span>{' '}
              must be precisely formatted to maintain high levels of{' '}
              <em>discoverability</em>, <em>comparability</em>, and{' '}
              <em>database performance</em>.
            </Typography>

            <Typography style={{ marginTop: '16px' }}>
              The purpose of this guide is to support data submitters in:
            </Typography>

            <List>
              <ListItem className={classes.bodyListItem}>
                <ListItemText>
                  Preparing the dataset for inclusion in Simons CMAP,
                </ListItemText>
              </ListItem>

              <ListItem className={classes.bodyListItem}>
                <ListItemText>
                  Ensuring that the dataset is discoverable via CMAP search
                  capabilities and infrastructure,
                </ListItemText>
              </ListItem>

              <ListItem className={classes.bodyListItem}>
                <ListItemText>
                  Ensuring that the dataset contains the information that users
                  require to understand the dataset.
                </ListItemText>
              </ListItem>
            </List>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="submission-process"></a>
              The Submission Process
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              Begin the process by downloading and populating a&nbsp;
              <Link
                href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
                download="datasetTemplate.xlsx"
              >
                blank xlsx template.
              </Link>
              &nbsp;Completed sample templates can be found in the&nbsp;
              <Link href="#resources">resources section</Link>. Details on the
              requirements and structure can be found in the&nbsp;
              <Link href="#data-structure">Data Structure</Link> section.
            </Typography>

            <Typography style={{ marginTop: '16px' }}>
              Please note that xlsx workbooks over 150MB{' '}
              <em>cannot be processed</em> using the web submission tools. If
              you would like to submit a dataset that exceeds this limit please
              contact the data curation team at{' '}
              <a
                style={{ color: colors.primary, textDecoration: 'none' }}
                href="mailto:cmap-data-submission@uw.edu"
              >
                cmap-data-submission@uw.edu
              </a>
              .
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Validation
              <a className={classes.anchor} id="validation"></a>
            </Typography>

            <Typography>
              Load your workbook into the&nbsp;
              <Link target="_blank" href="/datasubmission/validationtool">
                submission tool
              </Link>
              &nbsp;to begin validation. The tool will walk you through a
              step-by-step process to identify and resolve any potential data or
              format issues. Once the workbook has been validated it will be
              uploaded to a staging area to be reviewed by our data curation
              team. From this point you'll be able to track the progress of your
              submission in the&nbsp;
              <Link href="#dashboard">user dashboard</Link> as shown in{' '}
              <Link href="#body-fig-1">figure 1</Link>.
            </Typography>

            <figure style={{ margin: '30px 0 0 0' }}>
              <a className={classes.anchor} id="body-fig-1"></a>
              <img
                style={{
                  marginTop: '12px',
                  maxWidth: '100%',
                  border: '1px solid white',
                }}
                src="/images/cmap_user_dashboard_process_tracking.png"
                alt="User Dashboard Ingestion Process Tracker"
              />

              <figcaption>
                Figure 1. The progress of a dataset from Submission to
                Ingestion.
              </figcaption>
            </figure>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Feedback
              <a className={classes.anchor} id="feedback"></a>
            </Typography>

            <Typography>
              The data curation team may have suggestions for additional changes
              to the workbook. Any feedback will be sent through the{' '}
              <Link href="#dashboard">user dashboard</Link>, and you will be
              notified via email.
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              DOI
              <a className={classes.anchor} id="doi"></a>
            </Typography>

            <Typography>
              Once your submission has been approved the data curation team will
              request a DOI for the data. Information on DOIs can be found in
              the&nbsp;
              <Link href="#faq-doi">DOI Help Section</Link>. The DOI can be
              submitted using the messaging feature of the{' '}
              <Link href="#dashboard">user dashboard</Link>.
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Ingestion
              <a className={classes.anchor} id="ingestion"></a>
            </Typography>

            <Typography>
              Once a DOI has been submitted your data will be ingested into the
              CMAP database. After ingestion, you'll be able to view your
              dataset in the{' '}
              <Link href="/catalog" target="_blank">
                data catalog
              </Link>
              , create plots and figures through the{' '}
              <Link href="/visualization/charts" target="_blank">
                CMAP web visualization tool
              </Link>
              , and access it through the CMAP API using any of the CMAP&nbsp;
              <Link
                href="https://cmap.readthedocs.io/en/latest/user_guide/API_ref/api_ref.html"
                target="_blank"
              >
                software packages
              </Link>
              .
            </Typography>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="dashboard"></a>
              User Dashboard
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              In the&nbsp;
              <Link href="/datasubmission/userdashboard" target="_blank">
                user dashboard
              </Link>
              &nbsp; you can track the ingestion process for any dataset that
              you've submitted, send messages to the data curation team, and
              download the most recently submitted version of the workbook. If
              the curation team requests additional changes to your submission
              you can load the most recent version directly into the validation
              tool, make any necessary changes, and resubmit.
            </Typography>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="data-structure"></a>
              Data Structure
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              The CMAP data template consists of three sheets: data, dataset
              metadata, and variable metadata. Data is stored in the first sheet
              labeled “data”. Metadata that describes the dataset is entered in
              the second sheet called “dataset_meta_data”. Metadata associated
              with the variables in the dataset are entered in the third sheet
              labeled “vars_meta_data”. Information must be provided for all
              columns except those specifically noted as optional. The data and
              metadata field names (e.g. time, lat, lon, short_name, long_name,
              ...) used in the template file are based on the CF and COARDS
              naming conventions [<Link href="#reference-1">1</Link>,&nbsp;
              <Link href="#reference-2">2</Link>,&nbsp;
              <Link href="#reference-3">3</Link>
              ].
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Data
              <a className={classes.anchor} id="data-structure-data"></a>
            </Typography>

            <Table size="small" style={{ marginBottom: '12px' }}>
              <TableHead>
                <TableRow className={classes.sampleTableRow}>
                  <TableCell>time</TableCell>
                  <TableCell>lat</TableCell>
                  <TableCell>lon</TableCell>
                  <TableCell>depth[if exists]</TableCell>
                  <TableCell>
                    var<sub>1</sub>
                  </TableCell>
                  <TableCell>...</TableCell>
                  <TableCell>
                    var<sub>n</sub>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow className={classes.sampleTableRow}>
                  <TableCell>2016-5-01T15:02:00</TableCell>
                  <TableCell>25</TableCell>
                  <TableCell>-158</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>value</TableCell>
                  <TableCell>...</TableCell>
                  <TableCell>value</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography>
              All data points are stored in the “Data” sheet. Each data point
              must have time and location information. The exact name and order
              of the time and location columns are shown in the table above. If
              a dataset does not have depth values (e.g., sea surface
              measurements), you may remove the depth column. If your dataset
              represents results of a Laboratory study (see dataset_make) fill
              these fields with the time of study and the location of your
              laboratory. The columns var<sub>1</sub>...var<sub>n</sub>{' '}
              represent the dataset variables (measurements). Please rename var
              <sub>1</sub>...var<sub>n</sub> to names appropriate to your data.
              The format of “time”, “lat”, “lon”, and “depth” columns are
              described in the following sections. Please review the example
              datasets listed under&nbsp;
              <Link href="#resources">resources</Link> for more detailed
              information.
            </Typography>

            {dsGuideItems.dataItems.map((e, i) => (
              <DSGuideItem item={e} key={i} />
            ))}

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Dataset Metadata
              <a className={classes.anchor} id="data-structure-dataset"></a>
            </Typography>

            <Typography>
              This sheet holds a list of top-level attributes about the dataset
              such as the dataset name and description. Below are the list of
              these attributes along with their descriptions. Please review the
              example datasets listed under{' '}
              <Link href="#resources">resources</Link> for more detailed
              information.
            </Typography>

            {dsGuideItems.datasetMetadataItems.map((e, i) => (
              <DSGuideItem item={e} key={i} />
            ))}

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Variable Metadata
              <a className={classes.anchor} id="data-structure-variable"></a>
            </Typography>

            <Typography>
              A dataset can contain multiple different measurements (variables).
              This sheet (labeled as "vars_meta_data") holds a list of top-level
              attributes about these variables such as the variable name, unit,
              and description. Each variable along with its attributes
              (metadata) is stored in separate rows. Below is the list of these
              attributes along with their descriptions. Please review the
              example datasets listed in the&nbsp;
              <Link href="#resources">resources</Link> section for more
              information.
            </Typography>

            {dsGuideItems.variableMetadataItems.map((e, i) => (
              <DSGuideItem item={e} key={i} />
            ))}

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              References
              <a className={classes.anchor} id="data-structure-references"></a>
            </Typography>

            <Typography>
              <a className={classes.anchor} id="reference-1"></a>
              <Link
                href="http://cfconventions.org/cf-conventions/cf-conventions.html"
                target="_blank"
              >
                [1] NetCDF Climate and Forecast (CF) Metadata Conventions
              </Link>
            </Typography>

            <Typography>
              <a className={classes.anchor} id="reference-2"></a>
              <Link
                href="https://ferret.pmel.noaa.gov/noaa_coop/coop_cdf_profile.html"
                target="_blank"
              >
                [2] Conventions for the standardization of NetCDF files
              </Link>
            </Typography>

            <Typography>
              <a className={classes.anchor} id="reference-3"></a>
              <Link
                href="https://ferret.pmel.noaa.gov/Ferret/documentation/coards-netcdf-conventions"
                target="_blank"
              >
                [3] COARDS NetCDF Conventions
              </Link>
            </Typography>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="faq"></a>
              FAQ &amp; Help
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              What is a DOI and how can I get one for my dataset?
              <a className={classes.anchor} id="faq-doi"></a>
            </Typography>

            <Typography>
              A <em>DOI</em> or <em>Digital Object Identifier</em> is a digital
              identifier for a dataset. Some DOI providers, such as Zenodo,
              allow for dataset version controlling. We require a DOI to be
              registered for your dataset in the submission process. It allows
              for users to cite the use of a dataset and properly acknowledge
              the dataset creators.
            </Typography>

            <Typography style={{ marginTop: '24px' }}>
              Below is a list of entities that may issue and link your dataset
              to a unique DOI:
            </Typography>

            <List>
              {doiProviderList.map((e, i) => (
                <ListItem
                  target="_blank"
                  component="a"
                  href={e.link}
                  className={classes.doiListItem}
                  key={i}
                >
                  <ListItemText
                    primary={e.name}
                    classes={{ primary: classes.doiListItemText }}
                    className={classes.doiListItemtextWrapper}
                  />
                </ListItem>
              ))}
            </List>

            <Typography style={{ margin: '18px 0' }}>
              See the tutorial video below to learn how to obtain a DOI for your
              dataset using Zenodo.
            </Typography>

            <iframe
              src="https://player.vimeo.com/video/407462463"
              width="780"
              height="440"
              style={{ margin: '0 auto' }}
            ></iframe>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Isn't this automated? Why do I need to wait for feedback from a
              curator?
              <a className={classes.anchor} id="faq-curation"></a>
            </Typography>

            <Typography>
              The online validator is designed to catch formatting issues,
              missing information, and fields which don't meet CMAP's ingestion
              requirements. Evaluating the accuracy and descriptiveness of
              metadata requires significant domain knowledge and understanding
              of the CMAP ecosystem, and is best done by a human.
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              What should I do about the validation warnings?
              <a className={classes.anchor} id="faq-curation"></a>
            </Typography>

            <Typography>
              Validation warnings, if present, will appear in yellow when you
              select your workbook in the validation tool, indicating{' '}
              <em>possible</em> errors in your data or metadata such as
              outliers, columns with mixed data types, or missing cruise
              information. They should be reviewed carefully, but if you
              determine they do not need to be corrected they will not prevent
              you from moving forward with your submission.
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginTop: '50px' }}
            >
              Can I submit a preliminary version of a dataset?
              <a className={classes.anchor} id="faq-preliminary"></a>
            </Typography>

            <Typography>
              Yes, preliminary datasets that are not yet finalized but are
              usable and formatted for CMAP are invited for submission.
              Indication of this status, any caveats that users should take into
              consideration, and when to expect a dataset update can all be
              included in dataset_description to ensure users are aware.
              Versioning can be tracked by the dataset_version column in the
              Dataset Metadata sheet.
            </Typography>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="contact"></a>
              Contact
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              You can reach the CMAP data curation team at{' '}
              <a
                style={{ color: colors.primary, textDecoration: 'none' }}
                href="mailto:cmap-data-submission@uw.edu"
              >
                cmap-data-submission@uw.edu
              </a>
              .
            </Typography>

            <Typography
              variant="h3"
              className={classes.sectionHeader}
              style={{ marginTop: '80px' }}
            >
              <a className={classes.anchor} id="resources"></a>
              Resources
            </Typography>
            <Divider variant="fullWidth" classes={{ root: classes.divider }} />

            <Typography>
              <Link
                href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
                download="datasetTemplate.xlsx"
              >
                Download a Blank xlsx Template
              </Link>
            </Typography>

            <Typography>
              <Link
                href="https://github.com/simonscmap/DBIngest/raw/master/template/amt01_extracted_cholorphyll_2020_07_25.xlsx"
                download="AMT01_Extracted_Cholorphyll_Sample.xlsx"
              >
                Sample Dataset - amt01_extracted_cholorphyll
              </Link>
            </Typography>

            <Typography>
              <Link
                href="https://github.com/simonscmap/DBIngest/raw/master/template/Influx_Stations_Gradients_2016_example_2020_08_13.xlsx"
                download="Influx_Stations_Gradients_2016_example.xlsx"
              >
                Sample Dataset - Influx_Stations_Gradients_2016
              </Link>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(SubmissionGuide);
