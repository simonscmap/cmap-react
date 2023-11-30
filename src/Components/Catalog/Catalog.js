// Wrapper and layout for the catalog page
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withStyles, Grid, Paper, ThemeProvider } from '@material-ui/core';
import {
  fetchDatasetFeatures,
} from '../../Redux/actions/catalog';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';
import RecPanel from './RecPanel';
import metaTags from '../../enums/metaTags';
import { CATALOG_PAGE } from '../../constants';
import states from '../../enums/asyncRequestStates';

import { colors } from '../Home/theme';
import { homeTheme } from '../Home/theme';

import Intro from '../Navigation/Help/Intro';
import tourConfig from './help/tourConfig';

const styles = (theme) => ({
  page: {
    width: '100%',
    height: 'calc(100vh - 120px)',
    background: colors.gradient.slate2,
    paddingTop: '120px',
  },
  wrapper: {
    padding: '0 1em',
  },
  sectionHeading: {
    color: 'white',
    fontWeight: 200,
    textAlign: 'left',
    textIndent: '22px',
    margin: '0 0 .5em 0',
  },
  catalogRecs: {
    height: '100%',
    marginLeft: '10px',
    display: 'flex',
    flexDirection: 'column',
    '& > div': {
      flex: 1,
      display: 'flex',
    }
  },
  recPaper: {
    padding: '14px 20px',
  },
});

const Catalog = ({ classes }) => {
  let dispatch = useDispatch();

  let datasetFeatures = useSelector(
    (state) => state.catalog.datasetFeatures,
  );

  useEffect(() => {
    document.title = metaTags.catalog.title;
    document.description = metaTags.catalog.description;
    return () => {
      document.title = metaTags.default.title;
      document.description = metaTags.default.description;
     };
  });

  // on load, send request to load dataset features, which indicate
  // which datasets have features like ancillary data, or are continuously ingested
  // this only needs to run once
  if (!datasetFeatures) {
    dispatch(fetchDatasetFeatures());
  }

  let waitToLoadIntro = useSelector(({ searchResultsLoadingState }) => {
    // true indicates the Intro should wait; false that it should go ahead and render
    return searchResultsLoadingState !== states.succeeded;
  });

  // share a bit of UI state between Search and Results
  const [searchFiltersOpen, setSearchFiltersOpen] = useState (false);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.page}>
        <Intro config={tourConfig} wait={waitToLoadIntro} />
        <div id={`${CATALOG_PAGE}-style-context`} className={classes.wrapper}>
    <Grid container>


            <Grid item xs={8}>
              <div className={classes.catalogLiteral}>
                <h2 className={classes.sectionHeading}>Catalog Search</h2>
                <CatalogSearch setIsExpanded={setSearchFiltersOpen} />
                <SearchResults searchIsExpanded={searchFiltersOpen} />
              </div>
            </Grid>
            <Grid item xs={4}>
              <div className={classes.catalogRecs}>
                <h2 className={classes.sectionHeading}>Recommended Datasets</h2>
                <RecPanel />
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </ThemeProvider>
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
