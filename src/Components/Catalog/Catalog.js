// Wrapper and layout for the catalog page
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withStyles } from '@material-ui/core';
import {
  fetchDatasetFeatures
} from '../../Redux/actions/catalog';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';
import metaTags from '../../enums/metaTags';
import { CATALOG_PAGE } from '../../constants';
import states from '../../enums/asyncRequestStates';

import Intro from '../Navigation/Help/Intro';
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
    marginTop: '145px',
    padding: '20px',
    boxSizing: 'border-box',
    // the search and results panes float apart awkwardly at wide resolutions
    maxWidth: '2500px',
  },
});

const Catalog = ({ classes }) => {
  let dispatch = useDispatch();

  let datasetFeatures = useSelector(
    (state) => state.catalog.datasetFeatures,
  );

  // on load, send request to load dataset features, which indicate
  // which datasets have features like ancillary data, or are continuously ingested
  // this only needs to run once
  if (!datasetFeatures) {
    dispatch(fetchDatasetFeatures());
  }

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
    <div id={`${CATALOG_PAGE}-style-context`} className={classes.wrapperDiv}>
      <Intro config={tourConfig} wait={waitToLoadIntro} />
      <CatalogSearch />
      <SearchResults />
    </div>
  );
};

export default withStyles(styles)(Catalog);

export const catalogConfig = {
  route: '/',
  video: true,
  tour: true,
  hints: true,
  navigationVariant: 'Left',
};
