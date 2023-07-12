// Wrapper for search results
// uses react-window for windowing/occlusion culling to improve performance

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withStyles, Paper, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import stringify from 'csv-stringify/lib/sync';
import { FixedSizeList } from 'react-window';
import SearchResult from './SearchResult';
import '../../Stylesheets/catalog-search-results.css';
import ResizeObserver from 'react-resize-observer';

import {
  searchResultsFetch,
  searchResultsSetLoadingState,
} from '../../Redux/actions/catalog';
import states from '../../enums/asyncRequestStates';
import Hint from '../Navigation/Help/Hint';
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

const styles = (theme) => ({
  wrapperDiv: {
    boxSizing: 'border-box',
    flexGrow: '3',
  },
  resultsWrapper: {
    padding: '16px 0 16px 20px',
    margin: '-54px 0 24px 0',
    [theme.breakpoints.down('md')]: {
      padding: '0',
      margin: '26px 0 0 0',
    },
    backgroundColor: 'transparent',
    // remove the margin from the first result to make it
    // align with the top of the FixedSizeList and its scroll bar
    '& div.MuiPaper-root:first-child': {
      marginTop: 0,
    },
  },
  downloadWrapper: {
    fontSize: '1rem',
    color: 'white',
    cursor: 'pointer',    borderRadius: '6px',
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
    padding: '10px 0 0 15px',
    margin: '0 0 0 -15px',
    width: '100%',
    overflow: 'visible',
    // transparent scrollbar bg prevents box shadow of results from
    // being occluded
    scrollbarColor: '#9dd162 transparent',
  },
  fixedSizeListScrolled: {
    // make it look like the results are scrolling under a shadow
    background: `
        linear-gradient(transparent 30%, hsla(0,0%,100%, 0)),
        linear-gradient(hsla(0,0%,100%,0) 10px, white 70%) bottom,
        radial-gradient(at top, rgba(0,0,0,0.2), transparent 70%),
        radial-gradient(at bottom, rgba(0,0,0,0.2), transparent 70%) bottom`,

    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 20px, 100% 20px, 100% 10px, 100% 10px',
    backgroundAttachment: 'local, local, scroll, scroll',
    // boxShadow: '0px -10px 20px -15px #000000',
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
      <Typography
        id="catalog-search-result-count"
        className={classes.resultsCount}
      >
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
  const {
    searchResults,
    searchResultsLoadingState,
    searchResultsSetLoadingState: setLoadingState,
    searchResultsFetch: search,
    classes,
  } = props;

  useEffect(() => {
    setLoadingState(states.inProgress);
    search(props.location.search);
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

  let [hasScrolled, setHasScrolled] = useState(false);

  // keep track of the scroll offset for the fixedsizelist of results
  const onScroll = ({ scrollOffset: offset }) => {
    if (offset > 0 && !hasScrolled) {
      setHasScrolled(true);
    } else if (offset === 0 && hasScrolled) {
      setHasScrolled(false);
    }
  };

  let [itemHeight, setItemHeight] = useState(242);

  let onResize = (rect) => {
    let { width } = rect;
    // compare 'wrapperDiv' width to breakpoint of 640px
    let result = width > 640 ? 242 : 300;
    if (result !== itemHeight) {
      setItemHeight(result);
    }
  };

  const itemCount =
    searchResults && searchResults.length ? searchResults.length : 0;

  const loading = searchResultsLoadingState === states.inProgress;

  return (
    <div className={classes.wrapperDiv}>
      <ResizeObserver onResize={onResize}></ResizeObserver>
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
          className={`${classes.fixedSizeList} ${
            hasScrolled && classes.fixedSizeListScrolled
          } search-results-fixed-size-list`}
          itemData={searchResults}
          itemCount={itemCount}
          height={window.innerHeight - 140}
          itemSize={itemHeight}
          onScroll={onScroll}
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
)(withRouter(withStyles(styles)(SearchResults)));
