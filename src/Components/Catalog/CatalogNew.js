import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Paper } from '@material-ui/core';

import { keywordsFetch, searchOptionsFetch, searchResultsStore } from '../../Redux/actions/catalog';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';

import metaTags from '../../Enums/metaTags';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {
    searchOptionsFetch,
    searchResultsStore
}

const styles = (theme) => ({
    wrapperDiv: {
        marginTop: '68px',
        padding: '20px',
        boxSizing: 'border-box',
        [theme.breakpoints.down('sm')]: {
            padding: '20px 8px'
        },
        // overflow: 'hidden'
      },

      root: {
        width: '50vw',
        maxWidth: '1200px',
        minWidth: '480px',
        padding: '16px 24px',
        margin: '0 auto',
        transition: 'marginTop 2s'
    },
    
    searchGrid: {
        '@media (min-width: 960px)': {
            paddingTop: '62px'
        },
    }
});

const CatalogNew = (props) => {
    // useEffect(() => {
    //     props.searchOptionsFetch();        
    // }, []);

    const { classes } = props;

    useEffect(() => {
        document.title = metaTags.catalog.title;
        document.description = metaTags.catalog.description;

        return () => {
            document.title = metaTags.default.title;
            document.description = metaTags.default.description;
        }
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => document.body.style.overflow = 'auto'
    })

    return (
        <div className={props.classes.wrapperDiv}>
            <Grid container justify='center'>
                
                <Grid item xs={12} md={4} className={classes.searchGrid}>
                    <CatalogSearch/>                    
                </Grid>

                <Grid item xs={12} md={8}>
                    <SearchResults/>
                </Grid>
            </Grid>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CatalogNew));