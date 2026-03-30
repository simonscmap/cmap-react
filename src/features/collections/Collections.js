import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Tabs, Tab, Box } from '@material-ui/core';
import MyCollectionsTab from './myCollections/MyCollectionsTab';
import PublicCollectionsTab from './publicCollections/PublicCollectionsTab';
import useCollectionsStore from './state/collectionsStore';
import CreateCollectionModal from './createModal/CreateCollectionModal';
import { initializeCatalogSearch } from '../catalogSearch/api';
import { FeatureErrorBoundary } from '../../shared/errorCapture';

const useStyles = makeStyles((theme) => ({
  container: {
    color: 'white',
    padding: '20px 25px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  tabs: {
    marginTop: '32px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.primary.main,
    },
    '& .MuiTab-root': {
      fontSize: '1.2rem',
      paddingLeft: '16px',
      paddingRight: '16px',
      color: 'white',
    },
  },
  tabContent: {
    marginTop: theme.spacing(2),
  },
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collections-tabpanel-${index}`}
      aria-labelledby={`collections-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const Collections = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0);
  const user = useSelector((state) => state.user);
  const { fetchCollections } = useCollectionsStore();

  let prevUser = useRef(user);

  useEffect(() => {
    fetchCollections({ includeDatasets: true });
  }, [fetchCollections]);

  useEffect(() => {
    let loggedIn = !prevUser.current && user;
    prevUser.current = user;
    if (loggedIn) {
      fetchCollections({ includeDatasets: true });
    }
  }, [user, fetchCollections]);

  // Pre-load so modals avoid db init for better UX
  // downstream stores retry on failure
  useEffect(() => {
    initializeCatalogSearch().catch(() => {});
  }, []);

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <div className={classes.headerRow}>
          <Typography variant="h2">Dataset Collections</Typography>
          <CreateCollectionModal />
        </div>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="My Collections" />
          <Tab label="Public Collections" />
        </Tabs>

        <div className={classes.tabContent}>
          <TabPanel value={currentTab} index={0}>
            <MyCollectionsTab />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <PublicCollectionsTab />
          </TabPanel>
        </div>
      </Grid>
    </Grid>
  );
};

const CollectionsWithErrorBoundary = (props) => (
  <FeatureErrorBoundary featureName="collections">
    <Collections {...props} />
  </FeatureErrorBoundary>
);

export default CollectionsWithErrorBoundary;
