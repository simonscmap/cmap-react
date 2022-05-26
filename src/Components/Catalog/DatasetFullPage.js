// Individual dataset and member variable info page
// Text on this page has inline styling for font color because ag-grid's theme classes override mui classes when a dialog is opened
// from inside the grid

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import {
  withStyles,
  Link,
  Typography,
  Grid,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';

import ReactMarkdown from 'react-markdown';
import reactStringReplace from 'react-string-replace';

import DatasetPageAGGrid from './DatasetPageAGGrid';
import DatasetJSONLD from './DatasetJSONLD';
import DownloadDialog from './DownloadDialog';

import {
  datasetFullPageDataFetch,
  datasetFullPageDataStore,
} from '../../Redux/actions/catalog';

import states from '../../enums/asyncRequestStates';

import colors from '../../enums/colors';
import metaTags from '../../enums/metaTags';
import CartAddOrRemove from './CartAddOrRemove';
import SkeletonWrapper from '../UI/SkeletonWrapper';

import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

const mapStateToProps = (state, ownProps) => ({
  datasetFullPageDataLoadingState: state.datasetFullPageDataLoadingState,
  datasetFullPageData: state.datasetFullPageData,
});

const mapDispatchToProps = {
  datasetFullPageDataFetch,
  datasetFullPageDataStore,
};

const styles = (theme) => ({
  guideSection: {
    width: '80%',
    margin: '65px auto 0 auto',
    textAlign: 'left',
    padding: '12px 32px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 12px',
      margin: '16px auto 16px auto',
      width: '90%',
    },
    fontFamily: '"roboto", Serif',
    backgroundColor: 'rgba(0,0,0,.4)',
    marginBottom: '20px',
  },

  sectionHeader: {
    margin: '16px 0 2px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },

  divider: {
    backgroundColor: theme.palette.primary.main,
    marginBottom: '8px',
  },

  sampleTableRow: {
    '& td': {
      padding: '10px 24px 10px 16px',
    },
  },

  navListSubItemText: {
    fontSize: '.785rem',
  },

  navListSubSubItemText: {
    fontSize: '.7rem',
  },

  outerContainer: {
    marginTop: '70px',
    color: 'white',
  },

  markdown: {
    '& img': {
      maxWidth: '100%',
      margin: '20px auto 20px auto',
      display: 'block',
    },

    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
    },

    '& p': {
      fontSize: '1rem',
      fontFamily: '"Lato",sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },

  downloadLink: {
    color: colors.primary,
    display: 'inline-block',
    marginRight: '1em',
    '& > svg': {
      marginBottom: '-5px',
      marginRight: '5px',
    },
  },

  smallText: {
    fontSize: '.8rem',
  },

  tableHead: {
    fontWeight: 600,
  },

  pageHeader: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.4rem',
    },
  },

  helpIcon: {
    fontSize: '1.2rem',
  },

  helpButton: {
    padding: '12px 12px 12px 8px',
  },

  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    display: 'inline-block',
    marginTop: '6px',
    '& svg': {
      marginBottom: '-4px',
    },
  },

  cruiseLink: {
    display: 'block',
    marginBottom: '3px',
    color: colors.primary,
  },

  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
  },
});

const DatasetFullPage = (props) => {
  const {
    classes,
    datasetFullPageDataFetch,
    datasetFullPageDataStore,
    datasetFullPageData,
    datasetFullPageDataLoadingState,
  } = props;

  const {
    Variables,
    Acknowledgement,
    Data_Source,
    Depth_Max,
    Depth_Min,
    Description,
    Distributor,
    Lat_Max,
    Lat_Min,
    Lon_Max,
    Lon_Min,
    Long_Name,
    Short_Name,
    Table_Name,
    Time_Max,
    Time_Min,
    References,
    Make,
    Process_Level,
    Spatial_Resolution,
    Temporal_Resolution,
    Sensors,
    Cruises,
  } = datasetFullPageData;

  const loading = datasetFullPageDataLoadingState === states.inProgress;

  const [downloadDialogOpen, setDownloadDialogOpen] = React.useState(false);

  const httpRegx =
    /\b(https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|]|ftp:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|])/g;
  const urlify = (text) =>
    reactStringReplace(text, httpRegx, (match, i) => (
      <Link
        key={i}
        href={match}
        target="_blank"
        style={{ color: colors.primary }}
      >
        {match}
      </Link>
    ));

  // TODO no need to have a separate action called here to store the fetched data
  // just
  useEffect(() => {
    // trigger fetch of data
    // 'props.match.params.dataset' lets us refer to the named route parameter for this route, called 'dataset',
    // which is declared in App.js
    datasetFullPageDataFetch(props.match.params.dataset);
    // update redux with data
    return () => datasetFullPageDataStore({});
  }, []);

  useEffect(() => {
    document.title = Long_Name || metaTags.default.title;
    document.description = Description || metaTags.default.description;

    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
    };
  }, [Long_Name]);

  return (
    <Grid container className={classes.outerContainer}>
      {downloadDialogOpen ? (
        <DownloadDialog
          dialogOpen={downloadDialogOpen}
          dataset={datasetFullPageData}
          handleClose={() => setDownloadDialogOpen(false)}
        />
      ) : (
        ''
      )}

      <Grid item xs={12}>
        <Paper className={classes.guideSection} elevation={4}>
          <SkeletonWrapper loading={loading}>
            <Typography
              variant={'h4'}
              className={classes.pageHeader}
              style={{ color: 'white' }}
            >
              {Long_Name}
            </Typography>

            <Link
              component="button"
              onClick={() => setDownloadDialogOpen(true)}
              className={classes.downloadLink}
            >
              <CloudDownloadIcon />
              <span className={classes.bottomAlignedText}>Download Data</span>
            </Link>

            <CartAddOrRemove
              dataset={datasetFullPageData}
              cartButtonClass={classes.cartButtonClass}
            />

            <ReactMarkdown source={Description} className={classes.markdown} />

            <Table
              size="small"
              style={{ marginTop: '24px', maxWidth: '800px' }}
            >
              <TableBody>
                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Make</TableCell>
                  <TableCell>{Make}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Sensor{Sensors && Sensors.length > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>{Sensors ? Sensors.join(', ') : ''}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Process Level
                  </TableCell>
                  <TableCell>{Process_Level}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Database Table Name
                  </TableCell>
                  <TableCell>{Table_Name}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Database Dataset Name
                  </TableCell>
                  <TableCell>{Short_Name}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Temporal Resolution
                  </TableCell>
                  <TableCell>{Temporal_Resolution}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Date Start*
                  </TableCell>
                  <TableCell>
                    {Time_Min ? Time_Min.slice(0, 10) : 'NA'}
                  </TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Date End*</TableCell>
                  <TableCell>
                    {Time_Max ? Time_Max.slice(0, 10) : 'NA'}
                  </TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Spatial Resolution
                  </TableCell>
                  <TableCell>{Spatial_Resolution}</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Lat Min*</TableCell>
                  <TableCell>{Lat_Min}&deg;</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Lat Max*</TableCell>
                  <TableCell>{Lat_Max}&deg;</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Lon Min*</TableCell>
                  <TableCell>{Lon_Min}&deg;</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>Lon Max*</TableCell>
                  <TableCell>{Lon_Max}&deg;</TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Depth Min*
                  </TableCell>
                  <TableCell>
                    {Depth_Max ? Depth_Min + 'm' : 'Surface Only'}
                  </TableCell>
                </TableRow>

                <TableRow className={classes.sampleTableRow}>
                  <TableCell className={classes.tableHead}>
                    Depth Max*
                  </TableCell>
                  <TableCell>
                    {Depth_Max ? Depth_Max + 'm' : 'Surface Only'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography
              variant="caption"
              style={{
                margin: '4px 0 14px 4px',
                display: 'inline-block',
                color: 'white',
              }}
            >
              *Temporal and spatial coverage may differ between member variables
            </Typography>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginBottom: '16px', color: 'white' }}
            >
              Variables
            </Typography>

            {Variables ? <DatasetPageAGGrid Variables={Variables} /> : ''}

            {Data_Source || loading ? (
              <React.Fragment>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  Data Source
                </Typography>

                <Typography
                  className={classes.smallText}
                  style={{ color: 'white' }}
                >
                  {urlify(Data_Source)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {Distributor || loading ? (
              <React.Fragment>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  Distributor
                </Typography>

                <Typography
                  className={classes.smallText}
                  style={{ color: 'white' }}
                >
                  {urlify(Distributor)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {Acknowledgement || loading ? (
              <React.Fragment>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  Acknowledgement
                </Typography>

                <Typography
                  className={classes.smallText}
                  style={{ color: 'white' }}
                >
                  {urlify(Acknowledgement)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {(References && References.length) || loading ? (
              <React.Fragment>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  References
                </Typography>

                {!loading
                  ? References.map((reference, i) => (
                      <Typography
                        className={classes.smallText}
                        style={{ color: 'white', marginTop: '6px' }}
                        key={i}
                      >
                        {urlify(reference)}
                      </Typography>
                    ))
                  : ''}
              </React.Fragment>
            ) : (
              ''
            )}

            {Cruises && Cruises.length ? (
              <>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  Cruises contributing data to this dataset:
                </Typography>

                {Cruises.map((e) => (
                  <Link
                    component={RouterLink}
                    to={`/catalog/cruises/${e.Name}`}
                    key={e.Name}
                    className={classes.cruiseLink}
                  >
                    {e.Name}
                  </Link>
                ))}
              </>
            ) : (
              ''
            )}

            {!loading &&
            datasetFullPageData &&
            Object.keys(datasetFullPageData).length ? (
              <DatasetJSONLD {...datasetFullPageData} />
            ) : (
              ''
            )}
          </SkeletonWrapper>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(DatasetFullPage));
