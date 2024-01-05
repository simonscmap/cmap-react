import { ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Footer from './Footer';
import Hero from './Hero';
import News from './News';
import { homeTheme } from './theme';
import { withStyles } from '@material-ui/core/styles';
import homeStyles from './homeStyles';
import { useSelector, useDispatch } from 'react-redux';
import { requestNewsList } from '../../Redux/actions/news';
import { prepareHomepageNews } from '../Admin/News/lib';
import Grid from '@material-ui/core/Grid';
import Summary from './Summary';
import AnomalyMonitor from './AnomalyMonitor';
import ResizeObserver from 'react-resize-observer';
import { Typography } from '@material-ui/core';

const Home = withStyles(homeStyles)(({ classes }) => {
  let stories = useSelector(({ news }) => prepareHomepageNews(news.stories));
  let [w, setWidth] = useState(0);
  const onResize = () => {
    const el = document.getElementById('hero-container')
    if (el) {
      setWidth(el.clientWidth);
    }
  };

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.homeWrapper}>
        <div className={classes.mainWrapper}>
          <div className={classes.alignmentWrapper}>
            <Grid container > {/* main container*/}
              <Grid container xs={12} md={8} item direction="column"> {/* hero & callouts */}
                <Grid container item>
                  <ResizeObserver onResize={onResize}></ResizeObserver>
                  <Hero />
                </Grid>
                <Grid item>
                  <div className={classes.sectionTitle}>
                    <Typography variant="h2">
                      Global Anomaly Monitor
                    </Typography>
                    <Typography variant="body1" className={classes.anomalyIntroText} style={{ textAlign: 'left' }}>
The figure below provides a real-time summary of two example datasets you can find in the Simons CMAP database. They demonstrate globally averaged anomaly time series of <a href="/catalog/datasets/Near_Real_Time_SST_AVHRR_OI" target="_blank">Sea Surface Temperature (SST)</a> and <a href="/catalog/datasets/Altimetry_NRT_Signal" target="_blank">Absolute Dynamic Topography (ADT)</a> over the past few decades. To compute the anomalies, monthly time series of SST and ADT are computed at global scales. Anomaly time series are then achieved by subtracting the first 5-year average values. These plots are automatically updated every month. For more details contact <a href="mailto:mdehghan@uw.edu">Dr. Ashkezari</a>.
                    </Typography>
                  </div>
                  <AnomalyMonitor dim={{ width: w }} />
                </Grid>
              </Grid>
              <Grid container xs={12} md={4} item className={classes.rightGridContainer}> {/* stats summary & news */}
                <Summary />
                <News stories={stories} />
              </Grid>
            </Grid>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider >
  );
});

const DataWrapper = () => {
  let dispatch = useDispatch();
  // fetch news in a component that will not rerender
  dispatch(requestNewsList());
  return <Home />;
}

export default DataWrapper;

export const homepageConfig = {
  route: '/',
  video: true,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
