import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useCatalogSearchStore from '../state/catalogSearchStore';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  searchBox: {
    marginTop: 100,
    marginBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
  },
  resultBlock: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
    border: '1px solid #ccc',
  },
}));

const CatalogSearchDevPage = () => {
  const classes = useStyles();
  const [inputText, setInputText] = useState('');

  const {
    initialize,
    setSearchText,
    search,
    results,
    isInitialized,
    isSearching,
  } = useCatalogSearchStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleSearch = () => {
    setSearchText(inputText);
    search();
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.searchBox}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search "
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={!isInitialized || isSearching}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!isInitialized || isSearching || !inputText.trim()}
        >
          Search
        </Button>
      </Box>

      {results.length > 0 && (
        <Box style={{ marginBottom: 16, fontWeight: 'bold' }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </Box>
      )}

      {results.map((result) => (
        <Box key={result.datasetId} className={classes.resultBlock}>
          <div>{result.shortName}</div>
          {/* <div>{result.description}</div> */}
          <div>ID: {result.datasetId}</div>
        </Box>
      ))}
    </Container>
  );
};

export default CatalogSearchDevPage;
