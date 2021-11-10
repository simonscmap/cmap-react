// Wrapper for search results
// uses react-window for windowing/occlusion culling to improve performance

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { makeStyles, useTheme, Paper, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import stringify from 'csv-stringify/lib/sync';
import { FixedSizeList } from 'react-window';
import SearchResult from './SearchResult';
import '../../Stylesheets/catalog-search-results.css';

import {
  searchResultsFetch,
  searchResultsSetLoadingState,
} from '../../Redux/actions/catalog';
import states from '../../enums/asyncRequestStates';
import Hint from '../Help/Hint';
import downloadHint from './help/downloadSearchResults';
import SearchResultsStatusHint from './help/SearchResultsStatusHint';

const mapStateToProps = (state) => ({
  searchResults: state.searchResults,
  searchResultsLoadingState: state.searchResultsLoadingState,
});

const mapDispatchToProps = {
  searchResultsFetch,
  searchResultsSetLoadingState,
};

const useStyles = makeStyles({
  wrapperDiv: {
    padding: '0 20px 20px 20px',
    boxSizing: 'border-box',
    // overflow: 'visible',
    [(theme) => theme.breakpoints.down('sm')]: {
      padding: '0 0 20px 0',
    },
  },
  resultsWrapper: {
    width: '60vw',
    maxWidth: '1200px',
    padding: '16px 24px',
    margin: '8px 100px 24px auto',
    backgroundColor: 'transparent',
    [(theme) => theme.breakpoints.down('sm')]: {
      padding: '12px 4px 20px 4px',
      width: '90vw',
    },
    // remove the margin from the first result to make it
    // align with the top of the FixedSizeList and its scroll bar
    '& div.MuiPaper-root:first-child': {
      marginTop: 0,
    },
  },
  downloadWrapper: {
    fontSize: '1rem',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '6px',
    padding: '1px 8px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  downloadIcon: {
    marginRight: '7px',
    marginBottom: '-3px',
    fontSize: '1.2rem',
  },
  helpButton: {
    padding: '0 2px',
    marginTop: '-9.5px',
    color: 'white',
    fontSize: '1.2rem',
  },
  helpIcon: {
    color: 'white',
    fontSize: '1.2rem',
  },
  infoShelf: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '13px',
  },
  fixedSizeList: {
    // padding allows beacons to render without being clipped
    paddingTop: '10px',
    paddingRight: '10px',
    paddingLeft: '13px',
    width: '100%',
    overflow: 'visible',
    // transparent scrollbar bg prevents box shadow of results from
    // being occluded
    scrollbarColor: '#9dd162 transparent',
  },
  resultsCount: {
    textAlign: 'left',
    display: 'inline-block',
  },
});

const SearchResultStatusIndicator = ({ classes, loading, results }) => {
  return (
    <Hint
      content={SearchResultsStatusHint}
      styleOverride={{ beacon: { top: '-.5em' } }}
      position={{ beacon: 'top-end', hint: 'bottom-end' }}
      size={'medium'}
    >
      <Typography className={classes.resultsCount}>
        {loading ? 'Searching...' : `Found ${results.length} datasets:`}
      </Typography>
    </Hint>
  );
};

const InfoShelf = ({ classes, children }) => {
  // wraps results counter and dowload button above results list
  return <div className={classes.infoShelf}>{children}</div>;
};

const SearchResults = (props) => {
  const { searchResults, searchResultsSetLoadingState, searchResultsFetch } =
    props;

  useEffect(() => {
    searchResultsSetLoadingState(states.inProgress);
    searchResultsFetch(props.location.search);
  }, [props.location.search]);

  const handleDownloadSearchResults = () => {
    let csv = stringify(searchResults, {
      header: true,
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `CMAP_Search_Results.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const itemCount =
    searchResults && searchResults.length ? searchResults.length : 0;

  const loading = searchResultsSetLoadingState === states.inProgress;

  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <div className={classes.wrapperDiv}>
      <Paper className={classes.resultsWrapper} elevation={0}>
        <InfoShelf classes={classes}>
          <SearchResultStatusIndicator
            classes={classes}
            loading={loading}
            results={searchResults}
          />

          {searchResults && searchResults.length ? (
            <Hint
              content={downloadHint}
              position={{ beacon: 'left-start', hint: 'bottom-start' }}
              styleOverride={{ hint: { maxWidth: 'none' } }}
            >
              <Typography
                id="catalog-results-download"
                className={classes.downloadWrapper}
                onClick={() => handleDownloadSearchResults()}
              >
                <CloudDownload className={classes.downloadIcon} />
                Download Search Results
              </Typography>
            </Hint>
          ) : (
            ''
          )}
        </InfoShelf>

        <FixedSizeList
          className={`${classes.fixedSizeList} search-results-fixed-size-list`}
          itemData={searchResults}
          itemCount={itemCount}
          height={window.innerHeight - 140}
          itemSize={222}
        >
          {({ index, style }) => (
            <div style={style} className="result-wrapper">
              <SearchResult dataset={searchResults[index]} index={index} />
            </div>
          )}
        </FixedSizeList>
      </Paper>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(SearchResults));
