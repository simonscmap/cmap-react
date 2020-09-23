import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { withStyles, Link, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Paper, Table, TableRow, TableCell, TableBody } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import ReactMarkdown from 'react-markdown';
import XLSX from 'xlsx';

// import VariableDetails from './VariableDetails';
import DatasetPageAGGrid from './DatasetPageAGGrid';

import { datasetFullPageDataFetch, datasetFullPageDataStore } from '../../Redux/actions/catalog';

import states from '../../Enums/asyncRequestStates';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';


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
        marginTop: '70px'
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

    useEffect(() => {
        datasetFullPageDataFetch(props.match.params.dataset);

        return (() => datasetFullPageDataStore({}));
    }, []);

    useEffect(() => {
        document.title = Long_Name || 'Simons Collaborative Marine Ocean Atlas';

        return (() => document.title = 'Simons Collaborative Marine Ocean Atlas')
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
            {/* <Grid item xs={2}>
                <Paper className={classes.stickyPaper} elevation={6}>
                    <List dense={true}>
                        <ListItem component='a' href='#description' className={classes.navListItem}>
                            <ListItemText
                                primary="Description"
                                classes={{primary: classes.navListItemText}}
                                className={classes.navListItemtextWrapper}
                            />
                        </ListItem>

                        <ListItem component='a' href='#info-table' className={classes.navListItem}>
                            <ListItemText
                                primary="Info Table"
                                classes={{primary: classes.navListItemText}}
                                className={classes.navListItemtextWrapper}
                            />
                        </ListItem>

                        <ListItem component='a' href='#variables' className={classes.navListItem}>
                            <ListItemText
                                primary="Variables"
                                classes={{primary: classes.navListItemText}}
                                className={classes.navListItemtextWrapper}
                            />
                        </ListItem>

                        {
                            Distributor ?
                            <ListItem component='a' href='#distributor' className={classes.navListItem}>
                                <ListItemText
                                    primary="Distributor"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem> : ''                 
                        }

                        {
                            Acknowledgement ?
                            <ListItem component='a' href='#acknowledgement' className={classes.navListItem}>
                                <ListItemText
                                    primary="Acknowledgement"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem> : ''
                        }

                        {
                        References && References.length ? 
                            <ListItem component='a' href='#references' className={classes.navListItem}>
                                <ListItemText
                                    primary="References"
                                    classes={{primary: classes.navListItemText}}
                                    className={classes.navListItemtextWrapper}
                                />
                            </ListItem> : ''
                        }
                    </List>
                </Paper>
            </Grid> */}

            <Grid item xs={12}>
                <Paper className={classes.guideSection} elevation={4}>
                    <SkeletonWrapper loading={loading}>
                        <a className={classes.anchor} id='description'></a>
                        <Typography variant={'h4'} className={classes.pageHeader}>
                            {Long_Name}                    
                        </Typography>

                        <Link
                            component='button'
                            onClick={downloadMetadata}
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
                        <Typography variant='caption' style={{margin: '4px 0 14px 4px', display: 'inline-block'}}>
                            *Temporal and spatial coverage may differ between member variables
                        </Typography>

                        {/* <iframe src={Icon_URL ? Icon_URL.slice(0, -4) + '.html' : ''}/> */}

                        <Typography variant='h5' className={classes.sectionHeader} style={{marginBottom: '16px'}}>
                            <a className={classes.anchor} id='variables'></a>
                            Variables
                        </Typography>

                        {/* {Variables ? Variables.map((variable, i) => (
                            <Accordion key={i}>
                                <AccordionSummary classes={{expandIcon: classes.expandIcon}} expandIcon={<ExpandMore/>}>
                                    <Typography className={classes.variableLongName}>{variable.Long_Name}</Typography>
                                </AccordionSummary>
                                <VariableDetails variable={variable}/>
                            </Accordion>  
                        )) : ''} */}

                        {
                            Variables ? <DatasetPageAGGrid Variables={Variables}/> : ''
                        }

                        {(Data_Source) || loading ?
                        
                        <React.Fragment>
                                <Typography variant='h5' className={classes.sectionHeader}>
                                    <a className={classes.anchor} id='data-source'></a>
                                    Data Source
                                </Typography>

                                <Typography className={classes.smallText}>
                                    {Data_Source}
                                </Typography>
                        </React.Fragment>

                        : ''
                        }                                         

                        {
                            Distributor || loading ?

                            <React.Fragment>
                                <Typography variant='h5' className={classes.sectionHeader}>
                                    <a className={classes.anchor} id='distributor'></a>
                                    Distributor
                                </Typography>

                                <Typography className={classes.smallText}>
                                    {Distributor}
                                </Typography>
                            </React.Fragment>


                            : ''
                        }

                        {Acknowledgement || loading ?
                        
                            <React.Fragment>
                                    <Typography variant='h5' className={classes.sectionHeader}>
                                        <a className={classes.anchor} id='acknowledgement'></a>
                                        Acknowledgement
                                    </Typography>

                                    <Typography className={classes.smallText}>
                                        {Acknowledgement}
                                    </Typography>
                                </React.Fragment>


                                : ''                        
                        }

                        {(References && References.length) || loading ?
                        
                            <React.Fragment>
                                    <Typography variant='h5' className={classes.sectionHeader}>
                                        <a className={classes.anchor} id='references'></a>
                                        References
                                    </Typography>

                                    {!loading ?
                                        References.map((reference, i) => (
                                            <Typography className={classes.smallText} key={i}>
                                                {reference}
                                            </Typography>
                                        )) : ''}                            
                            </React.Fragment>

                            : ''
                        }                       
                    
                    </SkeletonWrapper>                    
                </Paper>
            </Grid>
        </Grid>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DatasetFullPage));

{/* <Divider variant='fullWidth' classes={{root: classes.divider}}/> */}