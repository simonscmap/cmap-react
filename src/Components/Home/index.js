import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
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

const Home = withStyles(homeStyles)(({ classes }) => {
  let stories = useSelector(({ news }) => prepareHomepageNews(news.stories));
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.homeWrapper}>
        <div className={classes.mainWrapper}>
          <div className={classes.alignmentWrapper}>
            <Grid container spacing={3}> {/* main container*/}
              <Grid container xs={12} md={8} item direction="column"> {/* hero & callouts */}
                <Grid container item>
                  <Hero />
                </Grid>
              </Grid>
              <Grid container xs={12} md={4} item> {/* stats summary & news */}
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
