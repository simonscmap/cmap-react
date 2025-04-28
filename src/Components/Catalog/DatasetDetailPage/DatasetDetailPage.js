// Individual dataset and member variable info page
// Text on this page has inline styling for font color because ag-grid's theme classes override mui classes when a dialog is opened
// from inside the grid

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Grid, Link, Typography, withStyles } from '@material-ui/core';

import ReactMarkdown from 'react-markdown';
import reactStringReplace from 'react-string-replace';

import DatasetPageAGGrid from '../VariablesTable';
import DatasetJSONLD from './DatasetJSONLD';
// import DownloadDialog from '../DownloadDialog';
import DetailsTable from './DatasetDetailsTable';
import DatasetMetadata from './DatasetMetadata';
import Visualization from './DatasetVisualization';
import SelectVariable from './SelectVariable';
import CruiseList from './CruiseList';
import ReferencesList from './References';
import NewsSection from './NewsSection';
import SectionHeader from './SectionHeader';
import SubscribeButton from '../../User/Subscriptions/SubscribeButton';
import { DownloadButtonOutlined } from '../DownloadDialog/DownloadButtons';
import styles from './datasetFullPageStyles';

import SkeletonWrapper from '../../UI/SkeletonWrapper';
import ErrorCard from '../../Common/ErrorCard';
import Spacer from '../../Common/Spacer';
import Page2 from '../../Common/Page2';

import {
  datasetFullPageNavigate,
  datasetFullPageDataFetch,
  datasetVariablesFetch,
  datasetVariableUMFetch,
} from '../../../Redux/actions/catalog';

import { fetchSubscriptions } from '../../../Redux/actions/user';

import states from '../../../enums/asyncRequestStates';
import colors from '../../../enums/colors';
import metaTags from '../../../enums/metaTags';

export const datasetDetailConfig = {
  route: '/',
  video: false,
  tour: false,
  hints: true,
  navigationVariant: 'Center',
};

const StandardHalfGridContent = (props) => {
  const { data } = props;
  if (data === undefined || data === null) {
    return <></>;
  }
  return (
    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
      {props.children}
    </Grid>
  );
};

const ThirdGridContent = (props) => {
  const { data } = props;
  if (data === undefined || data === null) {
    return <></>;
  }
  return (
    <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
      {props.children}
    </Grid>
  );
};

// Page Component
const DatasetFullPage = (props) => {
  const { classes } = props;

  const dispatch = useDispatch();

  const data = useSelector((state) => state.datasetDetailsPage.data);
  const cruises = useSelector((state) => state.datasetDetailsPage.cruises);
  const references = useSelector(
    (state) => state.datasetDetailsPage.references,
  );
  const sensors = useSelector((state) => state.datasetDetailsPage.sensors);
  const variables = useSelector((state) => state.datasetDetailsPage.variables);
  const news = useSelector((state) => state.datasetDetailsPage.news);
  const primaryPageLoadingState = useSelector(
    (state) => state.datasetDetailsPage.primaryPageLoadingState,
  );

  const subscriptions = useSelector((state) => state.userSubscriptions);

  let unstructuredDatasetMetadata = useSelector(
    (state) =>
      state.datasetDetailsPage.data &&
      state.datasetDetailsPage.data.Unstructured_Dataset_Metadata,
  );

  let acknowledgment = useSelector(
    (state) =>
      state.datasetDetailsPage.data &&
      state.datasetDetailsPage.data.Acknowledgement,
  );

  let dataSource = useSelector(
    (state) =>
      state.datasetDetailsPage.data &&
      state.datasetDetailsPage.data.Data_Source,
  );

  let description = useSelector(
    (state) =>
      state.datasetDetailsPage.data &&
      state.datasetDetailsPage.data.Description,
  );

  let distributor = useSelector(
    (state) =>
      state.datasetDetailsPage.data &&
      state.datasetDetailsPage.data.Distributor,
  );

  let longName = useSelector(
    (state) =>
      state.datasetDetailsPage.data && state.datasetDetailsPage.data.Long_Name,
  );

  const loading = primaryPageLoadingState === states.inProgress;
  const failed = primaryPageLoadingState === states.failed;

  // const [downloadDialogOpen, setDownloadDialogOpen] = React.useState(false);

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

  useEffect(() => {
    // trigger fetch of data
    // 'props.match.params.dataset' lets us refer to the named route parameter for this route, called 'dataset',
    // which is declared in App.js
    dispatch(datasetFullPageNavigate(props.match.params.dataset)); // triggers page data reset
    dispatch(datasetFullPageDataFetch(props.match.params.dataset));
    dispatch(datasetVariablesFetch(props.match.params.dataset));
    dispatch(datasetVariableUMFetch(props.match.params.dataset));
    if (!subscriptions) {
      dispatch(fetchSubscriptions());
    }
    return () => dispatch(datasetFullPageNavigate(null)); // triggers page data reset
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

  // const hasNews = Array.isArray (news) && news.length > 0;
  console.log('longName', longName);
  return (
    <Page2 bgVariant="slate2">
      <Grid container className={classes.outerContainer}>
        <Grid item xs={12}>
          <SkeletonWrapper loading={loading}>
            <Typography
              variant={'h4'}
              className={classes.pageHeader}
              style={{ color: 'white', marginBottom: '10px' }}
            >
              {longName}
            </Typography>

            <div className={classes.buttonsContainer}>
              <DownloadButtonOutlined shortName={data && data.Short_Name} />
              <SubscribeButton shortName={data && data.Short_Name} />
            </div>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <div className={classes.horizontalFlex}>
                  <div className={classes.descriptionContainer}>
                    <SectionHeader title={'Description'} />
                    <ReactMarkdown
                      source={description}
                      className={classes.markdown}
                    />
                  </div>
                  <NewsSection news={news} />
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
                <SelectVariable />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={8} xl={8}>
                <Visualization />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SectionHeader title={'Dataset Overview'} />
                <DetailsTable dataset={data} sensors={sensors} />
                <Typography
                  variant="body1"
                  className={classes.sectionHeader}
                  style={{ marginBottom: '16px', color: 'white' }}
                >
                  *Temporal and spatial coverage may differ between member
                  variables
                </Typography>
              </Grid>

              {unstructuredDatasetMetadata && (
                <Grid item xs={12}>
                  <SectionHeader title={'Additional Dataset Metadata'} />
                  <DatasetMetadata metadata={unstructuredDatasetMetadata} />
                </Grid>
              )}
            </Grid>

            <SectionHeader title={'Variables'} />
            <DatasetPageAGGrid />

            <Grid container spacing={3} className={classes.gridSection}>
              <ThirdGridContent data={dataSource}>
                <SectionHeader title={'Data Source'} />
                <Typography>{urlify(dataSource)}</Typography>
              </ThirdGridContent>
              <ThirdGridContent data={distributor}>
                <SectionHeader title={'Distributor'} />
                <Typography>{urlify(distributor)}</Typography>
              </ThirdGridContent>
              <ThirdGridContent data={acknowledgment}>
                <SectionHeader title={'Acknowledgement'} />
                <Typography>{urlify(acknowledgment)}</Typography>
              </ThirdGridContent>
            </Grid>

            <Grid container spacing={3} className={classes.gridSection}>
              <StandardHalfGridContent data={references}>
                <SectionHeader title={'References'} />
                <ReferencesList />
              </StandardHalfGridContent>
              <StandardHalfGridContent data={cruises}>
                <SectionHeader title={'Cruises'} />
                <CruiseList />
              </StandardHalfGridContent>
            </Grid>

            {!loading && variables && data && Object.keys(data).length ? (
              <DatasetJSONLD
                {...data}
                cruises={cruises}
                references={references}
                sensors={sensors}
                variables={variables}
              />
            ) : (
              ''
            )}
          </SkeletonWrapper>
          {/*</Paper>*/}
        </Grid>
      </Grid>
    </Page2>
  );
};

export default withStyles(styles)(DatasetFullPage);
