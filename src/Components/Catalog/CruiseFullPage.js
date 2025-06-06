// Cruise information (linked from explore cruises or dataset pages)

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import {
  withStyles,
  Typography,
  Grid,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import BulkDownloadSelectionTable from './BulkDownloadSelectionTable';

import {
  cruiseFullPageDataFetch,
  cruiseFullPageDataStore,
} from '../../Redux/actions/catalog';

import states from '../../enums/asyncRequestStates';
import metaTags from '../../enums/metaTags';
import SkeletonWrapper from '../UI/SkeletonWrapper';
import ErrorCard from '../Common/ErrorCard';
import Spacer from '../Common/Spacer';

const mapStateToProps = (state, ownProps) => ({
  cruiseFullPageDataLoadingState: state.cruiseFullPageDataLoadingState,
  cruiseFullPageData: state.cruiseFullPageData,
});

const mapDispatchToProps = {
  cruiseFullPageDataFetch,
  cruiseFullPageDataStore,
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
  cruiseInfoTable: {
    marginTop: '24px',
    marginBottom: '3em',
    maxWidth: '800px',
  },
  sectionHeader: {
    margin: '16px 0 2px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },

  sampleTableRow: {
    '& td': {
      padding: '10px 24px 10px 16px',
    },
  },

  outerContainer: {
    marginTop: '70px',
    color: 'white',
  },
  foo: {
    paddingTop: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHead: {
    fontWeight: 600,
  },

  pageHeader: {
    marginTop: '1em',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.4rem',
    },
  },

  datasetLink: {
    display: 'block',
    marginBottom: '3px',
  },
});

export const cruiseConfig = {
  route: '/',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};

const CruiseFullPage = (props) => {
  const {
    classes,
    cruiseFullPageDataFetch,
    cruiseFullPageDataStore,
    cruiseFullPageData,
    cruiseFullPageDataLoadingState,
  } = props;

  const {
    Nickname,
    Name,
    Ship_Name,
    Start_Time,
    End_Time,
    Lat_Min,
    Lat_Max,
    Lon_Min,
    Lon_Max,
    Chief_Name,
    datasets,
  } = cruiseFullPageData;

  const loading = cruiseFullPageDataLoadingState === states.inProgress;
  const failed = cruiseFullPageDataLoadingState === states.failed;

  useEffect(() => {
    cruiseFullPageDataFetch(props.match.params.cruiseName);

    return () => cruiseFullPageDataStore({});
  }, [cruiseFullPageDataFetch, cruiseFullPageDataStore]);

  useEffect(() => {
    document.title = Name || metaTags.defaultTitle;
    document.description = Name || metaTags.default.description;

    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
    };
  }, [Name]);

  if (failed) {
    let details = `You requested the cruise with the short name of ${props.match.params.cruiseName}.`;
    return (
      <div className={classes.foo}>
        <Spacer>
          <ErrorCard
            title="Error"
            message="There was a problem loading the page."
            details={details}
          />
        </Spacer>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Grid container className={classes.outerContainer}>
        <Grid item xs={12}>
          <Paper className={classes.guideSection} elevation={4}>
            <SkeletonWrapper loading={loading}>
              <Typography
                variant={'h4'}
                className={classes.pageHeader}
                style={{ color: 'white' }}
              >
                Cruise {Name}
              </Typography>

              <Table size="small" className={classes.cruiseInfoTable}>
                <TableBody>
                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>
                      Cruise Nickname
                    </TableCell>
                    <TableCell>{Nickname}</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>
                      Chief Scientist
                    </TableCell>
                    <TableCell>{Chief_Name}</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>
                      Ship Name
                    </TableCell>
                    <TableCell>{Ship_Name}</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>
                      Start Date
                    </TableCell>
                    <TableCell>
                      {Start_Time ? Start_Time.slice(0, 10) : 'NA'}
                    </TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>
                      End Date
                    </TableCell>
                    <TableCell>
                      {End_Time ? End_Time.slice(0, 10) : 'NA'}
                    </TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>Lat Min</TableCell>
                    <TableCell>{Lat_Min}&deg;</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>Lat Max</TableCell>
                    <TableCell>{Lat_Max}&deg;</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>Lon Min</TableCell>
                    <TableCell>{Lon_Min}&deg;</TableCell>
                  </TableRow>

                  <TableRow className={classes.sampleTableRow}>
                    <TableCell className={classes.tableHead}>Lon Max</TableCell>
                    <TableCell>{Lon_Max}&deg;</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Typography variant="h4">Associated Datasets</Typography>
              <Typography variant="body1">
                {' '}
                Datasets containing data collected on {Name}:{' '}
              </Typography>

              {datasets && datasets.length ? (
                <BulkDownloadSelectionTable
                  datasets={datasets}
                  cruiseShortName={Name}
                />
              ) : (
                <Typography variant="body1">No associated datasets.</Typography>
              )}
            </SkeletonWrapper>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(CruiseFullPage));
