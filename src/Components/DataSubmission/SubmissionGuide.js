import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Typography, Paperider, Grid, Paper } from '@material-ui/core';

import { ArrowRightAlt } from '@material-ui/icons';

const styles = (theme) => ({
    pageHeader: {
        color: 'white',
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(7),
        fontWeight: 100
    },

    guideSection: {
        color: 'white',
        width: '65vw',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: theme.spacing(8),
        padding: theme.spacing(2)
    },

    sectionHeader: {
        color: theme.palette.primary.main
    },

    sectionContent: {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2)
    },

    gridItem: {
        padding: theme.spacing(2)
    },

    getStartedPaper: {
        width: '50vw',
        color: theme.palette.primary.main,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: theme.spacing(12),
        padding: theme.spacing(2)        
    }
})

const SubmissionGuide = (props) => {
    const { classes } = props;

    return (
        <React.Fragment>
            <Typography variant='h3' className={classes.pageHeader}>
                Submitting Data to CMAP
            </Typography>

            <Paper className={classes.guideSection} elevation={9}>
                <Grid container>
                    <Grid item xs={12} md={7} className={classes.gridItem}>
                        <Typography variant='h5' align='left' className={classes.sectionHeader}>
                            The Simons CMAP Database
                        </Typography>

                        <Typography align='left' variant='body1' className={classes.sectionContent}>
                            Information about our database, its organization and indexing.
                        </Typography>
                        
                        <Typography align='left' variant='body1' className={classes.sectionContent}>
                            What does submitting data mean / data ingestion process
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={5} className={classes.gridItem}>
                        <img alt='What' width='100%' src='/images/catalog/viz_sample.png'/>
                    </Grid>
                </Grid>
            </Paper>

            <Paper className={classes.guideSection} elevation={9}>
                <Grid container>
                    <Grid item xs={12} md={5} className={classes.gridItem}>
                        <img alt='What' width='100%' src='/images/catalog/viz_sample.png'/>
                    </Grid>

                    <Grid item xs={12} md={7} className={classes.gridItem}>
                        <Typography variant='h5' align='left' className={classes.sectionHeader}>
                            The Simons CMAP Database
                        </Typography>

                        <Typography align='left' variant='body1' className={classes.sectionContent}>
                            Information about our database, its organization and indexing, importance of uniformity.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper className={classes.guideSection} elevation={9}>
                <Grid container>
                    <Grid item xs={12} md={7} className={classes.gridItem}>
                        <Typography variant='h5' align='left' className={classes.sectionHeader}>
                            The Simons CMAP Database
                        </Typography>

                        <Typography align='left' variant='body1' className={classes.sectionContent}>
                            Information about our database.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={5} className={classes.gridItem}>
                        <img alt='What' width='100%' src='/images/catalog/viz_sample.png'/>
                    </Grid>
                </Grid>
            </Paper>
        </React.Fragment>
    )
}

export default withStyles(styles)(SubmissionGuide);