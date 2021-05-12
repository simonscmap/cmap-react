import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { withStyles, Link, Typography, Grid, Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';

import { cruiseFullPageDataFetch, cruiseFullPageDataStore } from '../../Redux/actions/catalog';

import states from '../../Enums/asyncRequestStates';

import metaTags from '../../Enums/metaTags';
import SkeletonWrapper from '../UI/SkeletonWrapper';

const mapStateToProps = (state, ownProps) => ({
    cruiseFullPageDataLoadingState: state.cruiseFullPageDataLoadingState,
    cruiseFullPageData: state.cruiseFullPageData
})

const mapDispatchToProps = {
    cruiseFullPageDataFetch,
    cruiseFullPageDataStore
}

const styles = (theme) => ({
    guideSection: {
        width: '80%',
        margin: '20px auto 0 auto',
        textAlign: 'left',
        padding: '12px 32px',
        [theme.breakpoints.down('sm')]: {
            padding: '12px 12px',
            margin: '16px auto 16px auto',
            width: '90%'
        },
        fontFamily: '"roboto", Serif',
        backgroundColor: 'rgba(0,0,0,.4)',
        marginBottom: '20px'
    },

    sectionHeader: {
        margin: '16px 0 2px 0',
        fontWeight: 100,
        fontFamily: '"roboto", Serif', 
    },

    sampleTableRow: {
        '& td':{
            padding: '10px 24px 10px 16px'
        }
    },

    outerContainer: {
        marginTop: '70px',
        color: 'white'
    },

    tableHead: {
        fontWeight: 600
    },

    pageHeader: {
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.4rem'
        },
    },

    datasetLink: {
        display: 'block',
        marginBottom: '3px'
    }
});

const CruiseFullPage = (props) => {
    const { classes, cruiseFullPageDataFetch, cruiseFullPageDataStore, cruiseFullPageData, cruiseFullPageDataLoadingState } = props;

    const { 
        Nickname,
        Name,
        Ship_Name,
        Start_Time,
        End_Time,
        Lat_Min,
        Lat_Max,
        Lon_Min,
        Lon_Max,
        Chief_Name,
        datasets
    } = cruiseFullPageData;

    const loading = cruiseFullPageDataLoadingState === states.inProgress;

    useEffect(() => {
        cruiseFullPageDataFetch(props.match.params.cruiseName);

        return (() => cruiseFullPageDataStore({}));
    }, []);

    useEffect(() => {
        document.title = Name || metaTags.defaultTitle;
        document.description = Name || metaTags.default.description;

        return (() => {
            document.title = metaTags.default.title;
            document.description = metaTags.default.description;
        })
    }, [Name])

return (
        <React.Fragment>
            <Grid container className={classes.outerContainer}>
            <Grid item xs={12}>
                <Paper className={classes.guideSection} elevation={4}>
                    <SkeletonWrapper loading={loading}>
                        <Typography variant={'h4'} className={classes.pageHeader} style={{color: 'white'}}>
                            {Name}                    
                        </Typography>                        

                        <Table size='small' style={{marginTop: '24px', maxWidth: '800px'}}>
                            <TableBody>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Cruise Nickname
                                    </TableCell>
                                    <TableCell>
                                        {Nickname}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Chief Scientist
                                    </TableCell>
                                    <TableCell>
                                        {Chief_Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Ship Name
                                    </TableCell>
                                    <TableCell>
                                        {Ship_Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Start Time
                                    </TableCell>
                                    <TableCell>
                                        {Start_Time ? Start_Time.slice(0, 10) : 'NA'}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        End Time
                                    </TableCell>
                                    <TableCell>
                                        {End_Time ? End_Time.slice(0, 10) : 'NA'}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lat Min
                                    </TableCell>
                                    <TableCell>
                                        {Lat_Min}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lat Max
                                    </TableCell>
                                    <TableCell>
                                        {Lat_Max}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lon Min
                                    </TableCell>
                                    <TableCell>
                                        {Lon_Min}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lon Max
                                    </TableCell>
                                    <TableCell>
                                        {Lon_Max}&deg;
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>                        

                        {   datasets && datasets.length ?

                            <>
                                <Typography variant='h5' className={classes.sectionHeader} style={{margin: '24px 0 12px 0', color: 'white'}}>
                                    Datasets containing data collected on this cruise:
                                </Typography>

                                {
                                    datasets.map((e) => (
                                        <Link 
                                            component={RouterLink} 
                                            to={`/catalog/datasets/${e.Dataset_Name}`}
                                            key={e.Dataset_Long_Name}
                                            className={classes.datasetLink}
                                        >
                                            {e.Dataset_Long_Name}
                                        </Link>
                                    ))
                                }
                            </>


                            : ''
                        }
                    </SkeletonWrapper>              
                </Paper>
            </Grid>
        </Grid>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CruiseFullPage));   