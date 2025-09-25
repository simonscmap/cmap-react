import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Tabs, Tab, Box } from '@material-ui/core';
import MyCollectionsTab from './myCollections/MyCollectionsTab';
import PublicCollectionsTab from './publicCollections/PublicCollectionsTab';
import useCollectionsStore from './state/collectionsStore';

const useStyles = makeStyles((theme) => ({
  container: {
    color: 'white',
    padding: '20px 25px',
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

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h1" gutterBottom>
          Collections
        </Typography>

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
