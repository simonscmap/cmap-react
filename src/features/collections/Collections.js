import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Tabs, Tab, Box, Button } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import MyCollectionsTab from './myCollections/MyCollectionsTab';
import PublicCollectionsTab from './publicCollections/PublicCollectionsTab';
import useCollectionsStore from './state/collectionsStore';

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
  createButton: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    borderRadius: '20px',
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      color: theme.palette.primary.dark,
      backgroundColor: 'transparent',
    },
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
  const { fetchCollections } = useCollectionsStore();

  // Fetch collections when component mounts
  // Backend automatically returns public collections for all users
  // and includes private collections if user is authenticated
  useEffect(() => {
    fetchCollections({ includeDatasets: false });
  }, [fetchCollections]);

  const handleTabChange = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCreateNewCollection = () => {
    console.log('create new collection button was clicked');
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <div className={classes.headerRow}>
          <Typography variant="h2">Dataset Collections</Typography>
          <Button
            variant="outlined"
            className={classes.createButton}
            startIcon={<Add />}
            onClick={handleCreateNewCollection}
          >
            Create New Collection
          </Button>
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

export default Collections;
