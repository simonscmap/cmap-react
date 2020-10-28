import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { withStyles, Link, Typography, Grid, Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import ReactMarkdown from 'react-markdown';
import XLSX from 'xlsx';

import DatasetPageAGGrid from './DatasetPageAGGrid';
import DatasetJSONLD from './DatasetJSONLD';
import DownloadDialog from './DownloadDialog';

import { datasetFullPageDataFetch, datasetFullPageDataStore } from '../../Redux/actions/catalog';

import states from '../../Enums/asyncRequestStates';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';

import colors from '../../Enums/colors';
import metaTags from '../../Enums/metaTags';
import CartAddOrRemove from './CartAddOrRemove';

// Text on this page has inline styling for font color because ag-grid's theme classes override mui classes when a dialog is opened
// from inside the grid


const mapStateToProps = (state, ownProps) => ({
    datasetFullPageDataLoadingState: state.datasetFullPageDataLoadingState,
    datasetFullPageData: state.datasetFullPageData
})

const mapDispatchToProps = {
    datasetFullPageDataFetch,
    datasetFullPageDataStore
}

const styles = (theme) => ({
    stickyPaper: {
        position: '-webkit-sticky',
        maxHeight: 'calc(100vh - 128px)',
        position: 'sticky',
        top: '90px',
        width: '160px',
        marginLeft: '20px',
        paddingLeft: '12px',
        backgroundColor: 'rgba(0,0,0,.4)',
        overflow: 'auto'
    },

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
        // maxWidth: '1000px',
        backgroundColor: 'rgba(0,0,0,.4)',
        marginBottom: '20px'
    },

    sectionHeader: {
        margin: '16px 0 2px 0',
        fontWeight: 100,
        fontFamily: '"roboto", Serif', 
    },

    '@media screen and (max-width: 1300px)': {
        stickyPaper: {
          display: 'none',
        },
    },

    navListItem: {
        color: theme.palette.primary.main,
        padding: '2px 10px 2px 6px'
    },

    navListItemText: {
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    doiListItem: {
        color: theme.palette.primary.main,
        padding: '0 10px 0 6px',
        width: 'max-content'
    },

    doiListItemText: {
        fontSize: '16px',
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    doiListItemtextWrapper: {
        margin: '0'
    },

    navListItemtextWrapper: {
        margin: '2px 0'
    },

    subListText: {
        margin: 0,
        '&:hover': {
            textDecoration: 'underline'
        }
    },

    anchor: {
        display: 'block',
        position: 'relative',
        top: '-120px',
        visibility: 'hidden'
    },

    divider: {
        backgroundColor: theme.palette.primary.main,
        marginBottom: '8px'
    },

    sampleTableRow: {
        '& td':{
            padding: '10px 24px 10px 16px'
        }
    },

    navListSubItemText: {
        fontSize: '.785rem'
    },

    navListSubSubItemText: {
        fontSize: '.7rem'
    },

    outerContainer: {
        marginTop: '70px',
        color: 'white'
    },

    markdown: {
        '& img': {
            maxWidth: '100%',
            margin: '20px auto 20px auto',
            display: 'block'
        },

        '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none'
        },

        '& p': {
            fontSize: '1rem',
            fontFamily: '"Lato",sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            
        }
    },

    smallText: {
        fontSize: '.8rem'
    },

    tableHead: {
        fontWeight: 600
    },

    variableLongName: {
        color: theme.palette.primary.main
    },

    pageHeader: {
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.4rem'
        },
    },

    helpIcon: {
        fontSize: '1.2rem'
    },

    helpButton: {
        padding: '12px 12px 12px 8px'
    },

    cartButtonClass: {
        textTransform: 'none',
        color: theme.palette.primary.main,
        marginTop: '16px'
    }
});

const SkeletonWrapper = (props) => {
    return props.loading ?
    (
        <React.Fragment>
            {props.children.map((child, i) => (
                <Skeleton key={i}>
                    {child}
                </Skeleton>
            ))}
        </React.Fragment>
    )

    :

    (
        <React.Fragment>
            {props.children.map((child, i) => (
                <React.Fragment key={i}>
                    {child}
                </React.Fragment>
            ))}
        </React.Fragment>
    )
}

const DatasetFullPage = (props) => {
    const { classes, datasetFullPageDataFetch, datasetFullPageDataStore, datasetFullPageData, datasetFullPageDataLoadingState } = props;

    const { 
        Variables,
        Acknowledgement,
        Data_Source,
        Depth_Max,
        Depth_Min,
        Description,
        Distributor,
        Lat_Max,
        Lat_Min,
        Lon_Max,
        Lon_Min,
        Long_Name,
        Short_Name,
        Table_Name,
        Time_Max,
        Time_Min,
        References,
        Make,
        Process_Level,
        Spatial_Resolution,
        Temporal_Resolution,
        Sensors
    } = datasetFullPageData;

    const loading = datasetFullPageDataLoadingState === states.inProgress;

    const [ downloadDialogOpen, setDownloadDialogOpen ] = React.useState(false);

    useEffect(() => {
        datasetFullPageDataFetch(props.match.params.dataset);

        return (() => datasetFullPageDataStore({}));
    }, []);

    useEffect(() => {
        document.title = Long_Name || metaTags.defaultTitle;
        document.description = Description || metaTags.defaultDescription;

        return (() => {
            document.title = metaTags.default.title;
            document.description = metaTags.default.descriptionescription;
        })
    }, [Long_Name])

    const downloadMetadata = () => {
        let fullPageData = {...datasetFullPageData};
        delete fullPageData.Variables;

        let workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([fullPageData]), 'Dataset Metadata');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Variables), 'Variable Metadata');
        XLSX.writeFile(workbook, `${Short_Name}_Metadata'.xlsx`);
    }    

    return (
        <Grid container className={classes.outerContainer}>
            {downloadDialogOpen ? 
            
            <DownloadDialog
                dialogOpen={downloadDialogOpen}
                dataset={datasetFullPageData}
                handleClose={() => setDownloadDialogOpen(false)}
            />       
            : ''}
            
            <Grid item xs={12}>
                <Paper className={classes.guideSection} elevation={4}>
                    <SkeletonWrapper loading={loading}>
                        <a className={classes.anchor} id='description'></a>
                        <Typography variant={'h4'} className={classes.pageHeader} style={{color: 'white'}}>
                            {Long_Name}                    
                        </Typography>                        

                        <ReactMarkdown source={Description} className={classes.markdown}/>

                        <a className={classes.anchor} id='info-table'></a>

                        <Table size='small' style={{marginTop: '24px', maxWidth: '800px'}}>
                            <TableBody>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Make
                                    </TableCell>
                                    <TableCell>
                                        {Make}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Sensor{Sensors && Sensors.length > 1 ? 's' : ''}
                                    </TableCell>
                                    <TableCell>
                                        {Sensors ? Sensors.join(', ') : ''}
                                    </TableCell>
                                </TableRow>                                

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Process Level
                                    </TableCell>
                                    <TableCell>
                                        {Process_Level}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Database Table Name
                                    </TableCell>
                                    <TableCell>
                                        {Table_Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Database Dataset Name
                                    </TableCell>
                                    <TableCell>
                                        {Short_Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Temporal Resolution
                                    </TableCell>
                                    <TableCell>
                                        {Temporal_Resolution}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Time Start*
                                    </TableCell>
                                    <TableCell>
                                        {Time_Min ? Time_Min.slice(0, 10) : 'NA'}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Time End*
                                    </TableCell>
                                    <TableCell>
                                        {Time_Max ? Time_Max.slice(0, 10) : 'NA'}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Spatial Resolution
                                    </TableCell>
                                    <TableCell>
                                        {Spatial_Resolution}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lat Start*
                                    </TableCell>
                                    <TableCell>
                                        {Lat_Min}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lat End*
                                    </TableCell>
                                    <TableCell>
                                        {Lat_Max}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lon Start*
                                    </TableCell>
                                    <TableCell>
                                        {Lon_Min}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Lon End*
                                    </TableCell>
                                    <TableCell>
                                        {Lon_Max}&deg;
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Depth Start*
                                    </TableCell>
                                    <TableCell>
                                        {Depth_Max ? Depth_Min + 'm' : 'Surface Only'}
                                    </TableCell>
                                </TableRow>

                                <TableRow className={classes.sampleTableRow}>
                                    <TableCell className={classes.tableHead}>
                                        Depth End*
                                    </TableCell>
                                    <TableCell>
                                        {Depth_Max ? Depth_Max + 'm' : 'Surface Only'}
                                    </TableCell>
                                </TableRow>                                
                            </TableBody>
                        </Table>
                        <Typography variant='caption' style={{margin: '4px 0 14px 4px', display: 'inline-block', color: 'white'}}>
                            *Temporal and spatial coverage may differ between member variables
                        </Typography>

                        {/* <iframe src={Icon_URL ? Icon_URL.slice(0, -4) + '.html' : ''}/> */}

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginBottom: '16px', color: 'white'}}>
                            <a className={classes.anchor} id='variables'></a>
                            Variables
                        </Typography>

                        {
                            Variables ? <DatasetPageAGGrid Variables={Variables}/> : ''
                        }

                        {(Data_Source) || loading ?
                        
                        <React.Fragment>
                                <Typography variant='h5' className={classes.sectionHeader} style={{color: 'white'}}>
                                    <a className={classes.anchor} id='data-source'></a>
                                    Data Source
                                </Typography>

                                <Typography className={classes.smallText} style={{color: 'white'}}>
                                    {Data_Source}
                                </Typography>
                        </React.Fragment>

                        : ''
                        }                                         

                        {
                            Distributor || loading ?

                            <React.Fragment>
                                <Typography variant='h5' className={classes.sectionHeader} style={{color: 'white'}}>
                                    <a className={classes.anchor} id='distributor'></a>
                                    Distributor
                                </Typography>

                                <Typography className={classes.smallText} style={{color: 'white'}}>
                                    {Distributor}
                                </Typography>
                            </React.Fragment>


                            : ''
                        }

                        {Acknowledgement || loading ?
                        
                            <React.Fragment>
                                    <Typography variant='h5' className={classes.sectionHeader} style={{color: 'white'}}>
                                        <a className={classes.anchor} id='acknowledgement'></a>
                                        Acknowledgement
                                    </Typography>

                                    <Typography className={classes.smallText} style={{color: 'white'}}>
                                        {Acknowledgement}
                                    </Typography>
                                </React.Fragment>


                                : ''                        
                        }

                        {(References && References.length) || loading ?
                        
                            <React.Fragment>
                                    <Typography variant='h5' className={classes.sectionHeader} style={{color: 'white'}}>
                                        <a className={classes.anchor} id='references'></a>
                                        References
                                    </Typography>

                                    {!loading ?
                                        References.map((reference, i) => (
                                            <Typography className={classes.smallText} key={i} style={{color: 'white'}}>
                                                {reference}
                                            </Typography>
                                        )) : ''}                            
                            </React.Fragment>

                            : ''
                        }

                        <Typography variant='h5' className={classes.sectionHeader} style={{color: 'white'}}>
                            <a className={classes.anchor} id='data-access'></a>
                            Data Access
                        </Typography>

                        <Link
                            component='button'
                            onClick={downloadMetadata}
                            style={{color: colors.primary}}
                        >
                            Download Dataset Metadata
                        </Link>

                        <HelpButtonAndDialog
                            title='Downloading Metadata'
                            content={
                                <Typography>
                                    This link will download an xlsx workbook with a page containing
                                    the dataset's metadata, and a second page containing the metadata
                                    of its member variables.
                                </Typography>
                            }
                            iconClass={classes.helpIcon}
                            buttonClass={classes.helpButton}
                        />
                        
                        <Link
                            component='button'
                            onClick={() => setDownloadDialogOpen(true)}
                            style={{color: colors.primary, display: 'block'}}
                        >
                            Download Data
                        </Link>

                        <CartAddOrRemove dataset={datasetFullPageData} cartButtonClass={classes.cartButtonClass}/>  

                    {!loading && datasetFullPageData && Object.keys(datasetFullPageData).length ? <DatasetJSONLD {...datasetFullPageData}/> : ''}
                    </SkeletonWrapper>              
                </Paper>
            </Grid>
        </Grid>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DatasetFullPage));