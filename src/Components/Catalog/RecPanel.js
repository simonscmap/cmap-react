import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, Paper, Tabs, Tab, Tooltip, makeStyles } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import PopularDatasets, { usePopularDatasetRecs } from './PopularDatasets';
import RecentDatasets, { useRecentDatasetRecs } from './RecentlyUsed';
import RecommendedDatasets, { useRecommendedDatasets } from './Recommended';
import useLastApiCall from './useLastApiCall';
import { clearLastDatasetTouch } from '../../Redux/actions/user';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme) => ({
  recPaper: {
    padding: '14px 20px',
    background: 'rgba(0,0,0,0.2)'
  },
  gridContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1em',
    '& > div': {
      display: 'flex'
    }
  },
  tabPanel: {
    height: '100%',
  },
  recResultList: {
    textAlign: 'left',
  },
  hero: {
    width: '100%',
    flex: 2,
    '& > span': {
      width: '100%',
      transform: 'none',
    }
  },
  logInButton: {
    color: theme.palette.primary.light,
    textTransform: 'none',
    overflow: 'hidden',
    marginLeft: '1em'
  }
}));

/* Tabs */

const TabPanel = (props) => {
  const { children, value, index } = props;
  if (value !== index) {
    return <React.Fragment />;
  }
  if (!children) {
    return <React.Fragment />;
  }
  return (
    <div role="tabpanel" id={`tabpanel-${index}`}>
      {children}
    </div>
  );
}

const RecPanel = () => {
  const cl = useStyles ();
  const dispatch = useDispatch ();
  const history = useHistory();

  const user = useSelector ((state) => state.user);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, tabSelection) => {
    setActiveTab (tabSelection);
  };

  useEffect (() => {
    if ([1, 2].includes(activeTab)) {
      console.log (`tab ${activeTab} selected; clearing lastDatasetTouch`);
      dispatch(clearLastDatasetTouch ())
    } else {
      console.log ('not clearing lastDatasetTouch', activeTab);
    }
  }, [activeTab]);

  const redirectToLogin = () => {
    history.push (`/login?redirect=catalog`)
  };

  const isLgDown = useMediaQuery('(min-width:1280px)');

  // these hooks fetch recommendation data
  // (placing them in their tab panels delays fetch until tab becomes active)
  const touchResult = useLastApiCall ();
  const popularDatasets = usePopularDatasetRecs ();
  const recentDatasets = useRecentDatasetRecs ();
  const recommendedDatasets = useRecommendedDatasets ();

  return (
    <Paper elevation={4} className={cl.recPaper}>
      <div className={cl.gridContainer}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="white"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tooltip title="Datasets popular among CMAP users">
            <Tab label="Popular" />
          </Tooltip>

          {user ? (<Tooltip title="Datasets you have recently viewed">
            <Tab label="Recent" />
          </Tooltip>) : ('')}

          {user ? (<Tooltip title="Datasets similar to ones you have viewed">
            <Tab label="See Also" />
          </Tooltip>)
            : (
              <Button
                className={cl.logInButton}
                onClick={redirectToLogin}
              >
                <Grid container>
                  <Grid item>
                    {isLgDown ? 'Log in to see recommendations' : 'Log in'}
                  </Grid>
                </Grid>
              </Button>
            )}

        </Tabs>
        <TabPanel value={activeTab} index={0} className={cl.tabPanel}>
          <PopularDatasets data={popularDatasets} />
        </TabPanel>
        <TabPanel value={activeTab} index={1} className={cl.tabPanel}>
          <RecentDatasets data={recentDatasets} />
        </TabPanel>
        <TabPanel value={activeTab} index={2} className={cl.tabPanel}>
          <RecommendedDatasets data={recommendedDatasets}/>
        </TabPanel>
      </div>
    </Paper>
  );
};

export default RecPanel;
