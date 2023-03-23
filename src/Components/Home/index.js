import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import FeatureGrid from './FeatureGrid';
import Footer from './Footer';
import Hero from './Hero';
import NewsBanner from './NewsBanner';
import { homeTheme } from './theme';
import { withStyles } from '@material-ui/core/styles';
import homeStyles from './homeStyles';
import { useSelector, useDispatch } from 'react-redux';
import { requestNewsList } from '../../Redux/actions/news';
import { prepareHomepageNews } from '../Admin/News/lib';

const Home = withStyles(homeStyles)(({ classes }) => {
  let stories = useSelector(({ news }) => prepareHomepageNews(news.stories));
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.homeWrapper}>
        <Hero>
          <NewsBanner stories={stories} />
        </Hero>
        <FeatureGrid />
        <Footer />
      </div>
    </ThemeProvider>
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
