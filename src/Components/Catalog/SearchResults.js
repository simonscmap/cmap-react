import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles, Paper, Typography, Link } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';

import stringify from 'csv-stringify/lib/sync';

import { FixedSizeList } from 'react-window';

import SearchResult from './SearchResult';

import { searchResultsFetch, searchResultsStore, searchResultsSetLoadingState } from '../../Redux/actions/catalog';

import states from '../../Enums/asyncRequestStates';

import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';

const mapStateToProps = (state, ownProps) => ({
    searchResults: state.searchResults,
    searchResultsLoadingState: state.searchResultsLoadingState
})

const mapDispatchToProps = {
    searchResultsFetch,
    searchResultsStore,
    searchResultsSetLoadingState
}

const styles = (theme) => ({
    wrapperDiv: {
        padding: '0 20px 20px 20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        [theme.breakpoints.down('sm')]: {
            padding: '0 0 20px 0'
        },
      },
    
      root: {
        width: '60vw',
        maxWidth: '1200px',
        minWidth: '480px',
        padding: '16px 24px',
        margin: '8px auto 24px auto',
    },

    resultsWrapper: {
        width: '60vw',
        maxWidth: '1200px',
        padding: '16px 24px',
        margin: '8px auto 24px auto',
        backgroundColor: 'transparent',
        [theme.breakpoints.down('sm')]: {
            padding: '12px 4px 20px 4px',
            width: '90vw',
        },
    },   

    downloadWrapper: {
        fontSize: '1rem',
        color: 'white',
        marginTop: '-9px',
        cursor: 'pointer',
        borderRadius: '6px',
        padding: '1px 8px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }
    },

    downloadIcon: {
        marginRight: '7px',
        marginBottom: '-3px',
        fontSize: '1.2rem'
    },

    helpButton: {
        padding: '0 2px',
        marginTop: '-9.5px',
        color: 'white',
        fontSize: '1.2rem'
    },

    helpIcon: {
        color: 'white',
        fontSize: '1.2rem'
    }
});

const _mapStateToProps = (state, ownProps) => ({
    searchResults: state.searchResults,
    searchResultsLoadingState: state.searchResultsLoadingState
});

const _styles = (theme) => ({
    resultsCount: {
        marginTop: '-9px',
        textAlign: 'left',
        display: 'inline-block'
    },
})

const SearchResultStatusIndicator = connect(_mapStateToProps, null)(withStyles(_styles)((props) => {

    return (
        <Typography className={props.classes.resultsCount}>
            {
                props.searchResultsLoadingState === states.inProgress ?
                'Searching...' :
                `Found ${props.searchResults.length} datasets:`
            }
        </Typography>
    )
}));

const SearchResults = (props) => {
    const { classes, searchResults, searchResultsSetLoadingState, searchResultsFetch, searchResultsStore } = props;

    useEffect(() => {
        searchResultsSetLoadingState(states.inProgress);
        searchResultsFetch(props.location.search);

        return () => searchResultsStore([]);
    }, [props.location.search]);

    const handleDownloadSearchResults = () => {
        let csv = stringify(searchResults, {
            header: true
        });
    
        const blob = new Blob([csv], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `CMAP_Search_Results.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const itemCount = searchResults && searchResults.length ? searchResults.length : 0;

    return (
        <div className={classes.wrapperDiv}>
            <Paper className={classes.resultsWrapper} elevation={0}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <SearchResultStatusIndicator/>

                    {   
                        searchResults && searchResults.length ?
                        <div style={{display: 'flex', justifyContent: 'space-between', paddingRight: '8px'}}>
                            <Typography className={classes.downloadWrapper} onClick={() => handleDownloadSearchResults()}>
                                <CloudDownload className={classes.downloadIcon}/>
                                Download Search Results
                            </Typography>

                            <HelpButtonAndDialog
                                title='Download Search Results'
                                buttonClass={classes.helpButton}
                                iconClass={classes.helpIcon}
                                content={
                                    <Typography>
                                        This button will download a csv formatted file containing metadata for all datasets returned by your search.
                                    </Typography>}
                            />
                        </div>

                        : ''
                    }               
                    
                </div>

                <FixedSizeList
                    itemData={searchResults}
                    itemCount={itemCount}
                    height={itemCount * 222 || 500}
                    width='100%'
                    itemSize={200}
                    style={{overflow: 'visible'}}
                >
                    {({ index, style }) => (
                        <SearchResult dataset={searchResults[index]}/>
                    )}
                </FixedSizeList>

                {/* <div style={{minHeight: '70vh'}}>
                    {
                        searchResults.map(result => <SearchResult dataset={result} key={result.Short_Name}/>)
                    }
                </div> */}

            </Paper>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(SearchResults)));