import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Typography } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { colors } from './theme';
import {
  searchResultsFetch,
  searchResultsSetLoadingState,
} from '../../Redux/actions/catalog';
import { useDispatch, useSelector } from 'react-redux';
import states from '../../enums/asyncRequestStates';
import { debounce } from 'throttle-debounce';

let styles = {
  container: {
    width: '300px',
  },
  resultsContainer: {
    textAlign: 'left',
    padding: '.5em',
    lineHeight: '2em',
    height: '3em', // giving this a fixed height prevents flex
    // from repositioning siblings as content changes
    '& a': {
      color: colors.blue.teal,
    },
  },
  root: {
    border: `2px solid ${colors.blue.teal}`,
    borderRadius: '4px',
    background: colors.blue.dark,
    '& input': {
      border: 0, // `2px solid ${colors.blue.royal}`,
      outline: 0,
      '&$hover': {
        border: 0,
        outline: 0,
      },
    },
    '& fieldset': {
      border: 0,
      outline: 0,
    },
  },
};

const Results = ({ search = {}, terms = '' }) => {
  let { results, loading } = search;
  if (!terms || terms.length === 0) {
    return <Typography variant="body1">Enter search term...</Typography>;
  }

  switch (loading) {
    case states.notTried:
      return <Typography variant="body1">Enter search term...</Typography>;
    case states.inProgress:
      return <Typography variant="body1">Searching...</Typography>;
    case states.failed:
      return <Typography variant="body1">Search failed!</Typography>;
    case states.succeeded:
      if (results && results.length) {
        return (
          <React.Fragment>
            <Typography variant="body1">
              {results.length} datasets match your search
            </Typography>
            <Link to={`/catalog?keywords=${terms}`}>Go to the results</Link>
          </React.Fragment>
        );
      } else {
        return (
          <Typography variant="body1">No results match your search</Typography>
        );
      }
    default:
      return '';
  }
};

const SearchBox = ({ classes: cl }) => {
  let dispatch = useDispatch();
  let searchState = useSelector((state) => ({
    results: state.searchResults,
    loading: state.searchResultsLoadingState,
    options: state.searchOptions,
  }));

  let [searchTerm, setSearchTerm] = useState('');

  let search = debounce(1000, (term) => {
    dispatch(searchResultsSetLoadingState(states.inProgress));
    dispatch(searchResultsFetch(`?keywords=${term}`));
  });

  let change = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
   search(searchTerm);
  }, [searchTerm ]);

  // let history = useHistory();

  return (
    <div className={cl.container}>
      <TextField
        classes={{
          root: cl.root,
        }}
        name="catalog"
        placeholder="Search the CMAP Catalog"
        variant="outlined"
        onChange={change}
        fullWidth
        InputProps={{
          startAdornment: (
            <React.Fragment>
              <InputAdornment position="start">
                <Search style={{ color: colors.primary }} />
              </InputAdornment>
            </React.Fragment>
          ),
        }}
      />
      <div className={cl.resultsContainer}>
        <Results search={searchState} terms={searchTerm} />
      </div>
    </div>
  );
};

export default withStyles(styles)(SearchBox);
