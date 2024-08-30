import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import PopularDatasets, { usePopularDatasetRecs } from './PopularDatasets';
import RecentDatasets, { useRecentDatasetRecs } from './RecentlyUsed';
import RecommendedDatasets, { useRecommendedDatasets } from './Recommended';
// import useLastApiCall from './useLastApiCall';
import { clearLastDatasetTouch } from '../../Redux/actions/user';
import { showLoginDialog } from '../../Redux/actions/ui';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme) => ({
  recPaper: {
    padding: '14px 20px',
    background: 'rgba(0,0,0,0.2)',
    position: 'relative',
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

const LoginButton = withStyles ((theme) => ({
  buttonWrapper: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 100,
  },
  button: {
    color: theme.palette.primary.main,
  },
}))((props) => {
  const { classes: cl } = props;
  const dispatch = useDispatch ();
  const user = useSelector ((state) => state.user);

  const openLogin = (e) => {
    e.preventDefault();
    dispatch (showLoginDialog ())
  };

  const isLgDown = useMediaQuery('(min-width:1280px)');

  const text = isLgDown ? 'Log in to see recommendations' : 'Log In';

  if (user) {
    return <React.Fragment />;
  } else {
    return (
      <div className={cl.buttonWrapper}>
        <Button className={cl.button} onClick={openLogin}>
          {text}
        </Button>
      </div>
    )
  }
});

const RecPanel = () => {
  const cl = useStyles ();
  const dispatch = useDispatch ();

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

  // these hooks fetch recommendation data
  // (placing them in their tab panels delays fetch until tab becomes active)
  // const touchResult = useLastApiCall ();
  const popularDatasets = usePopularDatasetRecs ();
  const recentDatasets = useRecentDatasetRecs ();
  const recommendedDatasets = useRecommendedDatasets ();

  return (
    <Paper elevation={4} className={cl.recPaper}>
      <div className={cl.gridContainer}>
        <LoginButton />
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tooltip title="Datasets popular among CMAP users">
            <Tab label="Popular" />
          </Tooltip>

          {user ? ([
            <Tooltip title="Datasets you have recently viewed" key={'recent'}>
              <Tab label="Recent" />
            </Tooltip>,

            <Tooltip title="Datasets similar to ones you have viewed" key={'seealso'}>
              <Tab label="See Also" />
            </Tooltip>])
           : [] }
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
