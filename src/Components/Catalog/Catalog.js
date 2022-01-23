// Wrapper and layout for the catalog page
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withStyles, Grid } from '@material-ui/core';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';
import metaTags from '../../enums/metaTags';
import { CATALOG_PAGE } from '../../constants';
import states from '../../enums/asyncRequestStates';

import Intro from '../Help/Intro';
import tourConfig from './help/tourConfig';

const styles = (theme) => ({
  wrapperDiv: {
    display: 'flex',
    // arrange children in a row until screen hits md breakpoint
    // then stack controls on top of results
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
    marginTop: '120px',
    padding: '20px',
    boxSizing: 'border-box',
    // the search and results panes float apart awkwardly at wide resolutions
    maxWidth: '2500px',
  },
});

const Catalog = ({ classes }) => {
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
    return searchResultsLoadingState !== states.succeeded;
  });

  return (
    <React.Fragment>
      <Intro config={tourConfig} wait={waitToLoadIntro} />
      <div id={`${CATALOG_PAGE}-style-context`} className={classes.wrapperDiv}>
        <CatalogSearch />
        <SearchResults />
      </div>
    </React.Fragment>
  );
};

export default withStyles(styles)(Catalog);
