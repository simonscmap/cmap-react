import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Tabs, Tab, Box } from '@material-ui/core';
import MyCollectionsTab from './myCollections/MyCollectionsTab';
import PublicCollectionsTab from './publicCollections/PublicCollectionsTab';

const useStyles = makeStyles((theme) => ({
  container: {
    color: 'white',
    padding: '20px 25px',
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.primary.main,
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
