/* Catalog / SearchResults

   - Responsible for detecting changes to URL query string and dispatching
   search action.
   - Responsible for rendering searchResults from redux (updated out of band)
   - See: ./catalog-doc.md for overview of Catalog Search mechanism
   - Note: uses react-window for windowing/occlusion culling to improve performance

*/

import { Paper, Typography, withStyles } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import stringify from 'csv-stringify/lib/sync';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ResizeObserver from 'react-resize-observer';
import { withRouter } from 'react-router';
import { FixedSizeList } from 'react-window';
import '../../Stylesheets/catalog-search-results.css';
import SearchResult from './DatasetCardDetailed';

import {
  searchResultsFetch,
  searchResultsSetLoadingState,
} from '../../Redux/actions/catalog';
import initLogger from '../../Services/log-service';
import states from '../../enums/asyncRequestStates';
import Hint from '../Navigation/Help/Hint';
import SearchResultsStatusHint from './help/SearchResultsStatusHint';
import downloadHint from './help/downloadSearchResults';
import styles from './searchResultsStyles';

const log = initLogger('Catalog/SearchResults.js');

const mapStateToProps = (state) => ({
  searchResults: state.searchResults,
  searchResultsLoadingState: state.searchResultsLoadingState,
  sortingOptions: state.catalogSortingOptions,
});

const mapDispatchToProps = {
  searchResultsFetch,
  searchResultsSetLoadingState,
};

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
    searchIsExpanded,
    // sortingOptions,
    classes,
  } = props;

  useEffect(() => {
    // log.debug ('useEffect', { search: props.location.search });
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

  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [listHeight, setListHeight] = useState(
    Math.floor(window.innerHeight - 250),
  );

  const onResize = (rect) => {
    const { width } = rect;
    const intWidth = Math.floor(width);
    log.debug('results resize', intWidth);
    if (wrapperWidth !== intWidth) {
      setWrapperWidth(intWidth);
    }
  };

  useEffect(() => {
    // make the list area shorter when search filters are expanded
    const h = Math.floor(window.innerHeight - (searchIsExpanded ? 500 : 275));
    if (h !== listHeight) {
      setListHeight(h);
    }
  }, [wrapperWidth, searchIsExpanded]);

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
          height={listHeight}
          itemSize={420}
          onScroll={onScroll}
        >
          {({ index, style }) => <SearchResult style={style} index={index} />}
        </FixedSizeList>
      </Paper>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(SearchResults)));
