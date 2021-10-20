// Wrapper for search results
// uses react-window for windowing/occlusion culling to improve performance

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withStyles, Paper, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import stringify from 'csv-stringify/lib/sync';
import { FixedSizeList } from 'react-window';
import SearchResult from './SearchResult';
import {
  searchResultsFetch,
  searchResultsSetLoadingState,
} from '../../Redux/actions/catalog';
import states from '../../enums/asyncRequestStates';

const mapStateToProps = (state) => ({
  searchResults: state.searchResults,
  searchResultsLoadingState: state.searchResultsLoadingState,
});

const mapDispatchToProps = {
  searchResultsFetch,
  searchResultsSetLoadingState,
};

const styles = (theme) => ({
  wrapperDiv: {
    padding: '0 20px 20px 20px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      padding: '0 0 20px 0',
    },
  },

  resultsWrapper: {
    width: '60vw',
    maxWidth: '1200px',
    padding: '16px 24px',
    margin: '8px 100px 24px auto',
    backgroundColor: 'transparent',
    [theme.breakpoints.down('sm')]: {
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

  fixedSizeList: {
    marginTop: '10px',
    width: '100%',
  },
});

const _mapStateToProps = (state) => ({
  searchResults: state.searchResults,
  searchResultsLoadingState: state.searchResultsLoadingState,
});

const _styles = () => ({
  resultsCount: {
    textAlign: 'left',
    display: 'inline-block',
  },
});

const SearchResultStatusIndicator = connect(
  _mapStateToProps,
  null,
)(
  withStyles(_styles)((props) => {
    return (
      <Typography className={props.classes.resultsCount}>
        {props.searchResultsLoadingState === states.inProgress
          ? 'Searching...'
          : `Found ${props.searchResults.length} datasets:`}
      </Typography>
    );
  }),
);

const SearchResults = (props) => {
  const {
    classes,
    searchResults,
    searchResultsSetLoadingState,
    searchResultsFetch,
  } = props;

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

  return (
    <div className={classes.wrapperDiv}>
      <Paper className={classes.resultsWrapper} elevation={0}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SearchResultStatusIndicator />

          {searchResults && searchResults.length ? (
            <Typography
              id="catalog-results-download"
              className={classes.downloadWrapper}
              onClick={() => handleDownloadSearchResults()}
            >
              <CloudDownload className={classes.downloadIcon} />
              Download Search Results
            </Typography>
          ) : (
            ''
          )}
        </div>

        <FixedSizeList
          className={classes.fixedSizeList}
          itemData={searchResults}
          itemCount={itemCount}
          height={window.innerHeight - 140}
          itemSize={222}
        >
          {({ index, style }) => (
            <div style={style}>
              <SearchResult dataset={searchResults[index]} />
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
)(withStyles(styles)(withRouter(SearchResults)));
