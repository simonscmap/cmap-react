// Wrapper and layout for the catalog page

import React, { useEffect } from 'react';
import { withStyles, Grid } from '@material-ui/core';

import CatalogSearch from './CatalogSearch';
import SearchResults from './SearchResults';

import metaTags from '../../Enums/metaTags';

const styles = (theme) => ({
    wrapperDiv: {
        marginTop: '68px',
        padding: '20px',
        boxSizing: 'border-box',
        [theme.breakpoints.down('sm')]: {
            padding: '20px 8px'
        },
      },
    
    searchGrid: {
        '@media (min-width: 960px)': {
            paddingTop: '62px'
        },
    }
});

const Catalog = (props) => {

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
        <div className={classes.wrapperDiv}>
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

export default withStyles(styles)(Catalog);