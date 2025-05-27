import { Paper, Typography, withStyles } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import stringify from 'csv-stringify/lib/sync';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ResizeObserver from 'react-resize-observer';
import { Virtuoso } from 'react-virtuoso';
import '../../Stylesheets/catalog-search-results.css';
import DataSetCardDetailed from './DatasetCard/DatasetCardDetailed';

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

const SearchResultStatusIndicator = ({ classes, loading, results }) => (
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

const InfoShelf = ({ classes, children }) => (
  <div className={classes.infoShelf}>{children}</div>
);

const SearchResults = (props) => {
  const {
    searchResults,
    searchResultsLoadingState,
    searchResultsSetLoadingState: setLoadingState,
    searchResultsFetch: search,
    searchIsExpanded,
    classes,
  } = props;

  useEffect(() => {
    setLoadingState(states.inProgress);
    search(props.location.search);
  }, [props.location.search]);

  const handleDownloadSearchResults = () => {
    let csv = stringify(searchResults, { header: true });
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

  const [wrapperWidth, setWrapperWidth] = useState(0);

  const onResize = (rect) => {
    const { width } = rect;
    const intWidth = Math.floor(width);
    if (wrapperWidth !== intWidth) {
      setWrapperWidth(intWidth);
    }
  };

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
                onClick={handleDownloadSearchResults}
              >
                <CloudDownload className={classes.downloadIcon} />
                Download Search Results
              </Typography>
            </Hint>
          ) : (
            ''
          )}
        </InfoShelf>

        <Virtuoso
          className={classes.fixedSizeList}
          style={{
            height: Math.floor(
              window.innerHeight - (searchIsExpanded ? 500 : 275),
            ),
          }}
          data={searchResults}
          itemContent={(index, dataset) => (
            <div className="dataset-card-row">
              <DataSetCardDetailed index={index} />
            </div>
          )}
        />
      </Paper>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(SearchResults)));
