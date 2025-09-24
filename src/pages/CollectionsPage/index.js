import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Page2 from '../../Components/Common/Page2';
import { Grid, Typography, Tabs, Tab, Box } from '@material-ui/core';

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

const CollectionsPage = () => {
  const classes = useStyles();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Page2 bgVariant={'slate2'}>
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
              <Typography variant="body1">
                My Collections content - To be implemented
              </Typography>
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <Typography variant="body1">
                Public Collections content - To be implemented
              </Typography>
            </TabPanel>
          </div>
        </Grid>
      </Grid>
    </Page2>
  );
};

export default CollectionsPage;

export const collectionsPageConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
