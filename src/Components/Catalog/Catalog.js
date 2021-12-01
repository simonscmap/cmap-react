// Wrapper and layout for the catalog page
import React, { useEffect } from 'react';
import { withStyles, Grid } from '@material-ui/core';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';
import metaTags from '../../enums/metaTags';
import { CATALOG_PAGE } from '../../constants';
import '../../Stylesheets/intro-custom-blue.css';

import Intro from '../Help/Intro';
import tourConfig from './help/tourConfig';

const styles = (theme) => ({
  wrapperDiv: {
    marginTop: '68px',
    padding: '20px',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      padding: '20px 8px',
    },
    // the search and results panes float apart awkwardly at wide resolutions
    maxWidth: '2500px',
  },

  searchGrid: {
    '@media (min-width: 960px)': {
      paddingTop: '62px',
    },
  },
});

const Catalog = ({ classes }) => {
  // TODO these use effects return functions that are not used
  useEffect(() => {
    document.title = metaTags.catalog.title;
    document.description = metaTags.catalog.description;

    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
    };
  });

  let waitToLoadIntro = useSelector(({ searchResultsLoadingState }) => {
    // true indicates the Intro should wait; false that it should go ahead and render
    return  searchResultsLoadingState !== states.succeeded;
  });

  return (
    <React.Fragment>
      <Intro config={tourConfig} wait={waitToLoadIntro} />
      <div id={`${CATALOG_PAGE}-style-context`} className={classes.wrapperDiv}>
        <Grid container justify="center">
          <Grid item xs={12} md={4} className={classes.searchGrid}>
            <CatalogSearch />
          </Grid>

          <Grid item xs={12} md={8}>
            <SearchResults />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default withStyles(styles)(Catalog);
