// Individual dataset and member variable info page
// Text on this page has inline styling for font color because ag-grid's theme classes override mui classes when a dialog is opened
// from inside the grid

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import {
  withStyles,
  Link,
  Typography,
  Grid,
  Paper,
} from '@material-ui/core';

import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import ReactMarkdown from 'react-markdown';
import reactStringReplace from 'react-string-replace';

import DatasetPageAGGrid from '../VariablesTable';
import DatasetJSONLD from './DatasetJSONLD';
import DownloadDialog from '../DownloadDialog';
import DetailsTable from './DatasetDetailsTable';
import DatasetMetadata from './DatasetMetadata';
import Visualization from './DatasetVisualization';
import styles from './datasetFullPageStyles';

import CartAddOrRemove from '../CartAddOrRemove';
import SkeletonWrapper from '../../UI/SkeletonWrapper';
import ErrorCard from '../../Common/ErrorCard';
import Spacer from '../../Common/Spacer';

import {
  datasetFullPageNavigate,
  datasetFullPageDataFetch,
  datasetVariablesFetch,
  datasetVariableUMFetch,
} from '../../../Redux/actions/catalog';

import states from '../../../enums/asyncRequestStates';
import colors from '../../../enums/colors';
import metaTags from '../../../enums/metaTags';

// Page Component
const DatasetFullPage = (props) => {
  const { classes } = props;

  const dispatch = useDispatch ();

  const data = useSelector ((state) => state.datasetDetailsPage.data);

  const cruises = useSelector ((state) => state.datasetDetailsPage.cruises);

  const references = useSelector ((state) => state.datasetDetailsPage.references);

  const sensors = useSelector ((state) => state.datasetDetailsPage.sensors);

  const variables  = useSelector ((state) => state.datasetDetailsPage.variables);

  const primaryPageLoadingState = useSelector ((state) => state.datasetDetailsPage.primaryPageLoadingState);

  let unstructuredDatasetMetadata = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Unstructured_Dataset_Metadata);

  let acknowledgment = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Acknewledgment);

  let dataSource = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Data_Source);

  let description = useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Description);

  let distributor =  useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Distributor);

  let longName =  useSelector ((state) =>
    state.datasetDetailsPage.data && state.datasetDetailsPage.data.Long_Name);

  const loading = primaryPageLoadingState === states.inProgress;
  const failed = primaryPageLoadingState === states.failed;

  const [downloadDialogOpen, setDownloadDialogOpen] = React.useState(false);

  const httpRegx = /\b(https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|]|ftp:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|])/g;

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

  useEffect(() => {
    // trigger fetch of data
    // 'props.match.params.dataset' lets us refer to the named route parameter for this route, called 'dataset',
    // which is declared in App.js
    dispatch (datasetFullPageNavigate (props.match.params.dataset)); // triggers page data reset
    dispatch (datasetFullPageDataFetch (props.match.params.dataset));
    dispatch (datasetVariablesFetch (props.match.params.dataset));
    dispatch (datasetVariableUMFetch (props.match.params.dataset));
    return () =>
      dispatch (datasetFullPageNavigate (null)); // triggers page data reset
  }, []);

  useEffect(() => {
    document.title = longName || metaTags.default.title;
    document.description = description || metaTags.default.description;

    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
    };
  }, [longName]);

  if (failed) {
    let details = `You requested to view "${props.match.params.dataset}".`;
    return (
      <div className={classes.errorContainer}>
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
    <Grid container className={classes.outerContainer} >
      {downloadDialogOpen ? (
        <DownloadDialog
          dialogOpen={downloadDialogOpen}
          dataset={data}
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
              {longName}
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
              dataset={data}
              cartButtonClass={classes.cartButtonClass}
            />
            <Grid container spacing={3}>
              <Grid item md={12} lg={6}>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ marginBottom: '16px', color: 'white' }}
                >Description
                </Typography>
                <ReactMarkdown source={description} className={classes.markdown} />
              </Grid>

              <Grid item md={12} lg={6}>
                <Visualization />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ marginBottom: '16px', color: 'white' }}
                >Dataset Overview
                </Typography>

                <DetailsTable dataset={data} sensors={sensors} />

                <Typography
                  variant="body1"
                  className={classes.sectionHeader}
                  style={{ marginBottom: '16px', color: 'white' }}
                >
                  *Temporal and spatial coverage may differ between member variables
                </Typography>
              </Grid>


              { unstructuredDatasetMetadata &&
                <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    className={classes.sectionHeader}
                    style={{ marginBottom: '16px', color: 'white' }}
                  >
                    Additional Dataset Metadata
                </Typography>
                <DatasetMetadata metadata={unstructuredDatasetMetadata} />
                </Grid>}

            </Grid>

            <Typography
              variant="h5"
              className={classes.sectionHeader}
              style={{ marginBottom: '16px', color: 'white' }}
            >
              {variables ? `Variables (${variables.length})` : 'Variables'}
            </Typography>

            <DatasetPageAGGrid />

            {dataSource || loading ? (
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
                  {urlify(dataSource)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {distributor || loading ? (
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
                  {urlify(distributor)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {acknowledgment || loading ? (
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
                  {urlify(acknowledgment)}
                </Typography>
              </React.Fragment>
            ) : (
              ''
            )}

            {(references && references.length) || loading ? (
              <React.Fragment>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  References
                </Typography>

                {!loading
                  ? references.map((reference, i) => (
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

            {cruises && cruises.length ? (
              <>
                <Typography
                  variant="h5"
                  className={classes.sectionHeader}
                  style={{ color: 'white' }}
                >
                  Cruises contributing data to this dataset:
                </Typography>

                {cruises.sort((a, b) => {
                  const nameA = a.Name.toUpperCase();
                  const nameB = b.Name.toUpperCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                }).map((e) => (
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

            {!loading && variables && data && Object.keys(data).length ? (
              <DatasetJSONLD {...data}
                cruises={cruises}
                references={references}
                sensors={sensors}
                variables={variables}
              />
            ) : (
              ''
            )}
          </SkeletonWrapper>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(DatasetFullPage);
