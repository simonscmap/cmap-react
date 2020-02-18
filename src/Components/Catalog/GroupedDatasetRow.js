import React from 'react';

import { Typography, Grid, Table, TableBody, TableCell, TableRow, Button, IconButton } from '@material-ui/core';
import { ChevronRight, ExpandMore } from '@material-ui/icons';

import { withStyles } from '@material-ui/core/styles';

import colors from '../../Enums/colors';

const tableMapping2 = [
    ['Temporal Resolution', 'Temporal_Resolution'],
    ['Spatial Resolution', 'Spatial_Resolution']
];

const styles = (theme) => ({
    title:{
        marginBottom: theme.spacing(1)
    },
    datasetGroupWrapper: {
        // width: '90%',
        // margin: '0px auto 5px 10px',
        padding: '10px',
        height: '100%',
        userSelect: 'auto',
        textAlign: 'left',
        bozSizing: 'border-box'
    },

    nonDatasetGroupWrapper: {
        height: '100%',
        userSelect: 'auto',
        textAlign: 'left',
        paddingLeft: '18px',
        paddingTop: '10px'
    },

    infoCard: {
        padding: theme.spacing(1),
        width: '100%',
        height: '100%'
    },
    
    gridClass: {
        height: '100%',
        maxHeight: '200px',
    },

    datasetGridClass: {
        height: '100%',
        maxHeight: '200px'
    },

    gridItem: {
        // height: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        maxHeight: '200px'
    },

    adjustGridLeft: {
        marginLeft: '-7vw'
    },

    datasetDescriptionWrapper: {
        whiteSpace: 'normal',
        height: '100%',
        overflow: 'auto'
    },
    datasetDescription: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(1)
    },
    vizSampleImage: {
        maxWidth: '80%',
        maxHeight: '180px'
    },
    variableDetailTable: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '100%',
        tableLayout: 'fixed',
        marginBottom: theme.spacing(1)
    },
    variableDetailTableRow: {
        height: '24px',
        width: '100%'
    },
    variableDetailTableCell: {
        color: '#FFF6EC',
        borderBottomColor: 'black',
        fontSize: '11px',
        maxWidth: '100%',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingRight: '14px'
    },

    gridDetailTypography: {
        fontSize: '11px',
        whiteSpace: 'normal',
        width: '100%',
        display: 'block',
    },

    boldText: {
        fontWeight: 'bold'
    },

    rightGridItem: {
        maxWidth: '100%',
        paddingTop: '10px',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    datasetDescriptionButton: {
        backgroundColor: colors.primary,
        color: 'white',
        '&:hover': {
            backgroundColor: '#518516',
        },
        fontSize: '12px',
        maxWidth: '100%',
        margin: '0 auto',
        verticalAlign: 'middle'
    },
    
    buttonTextWrapper: {
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        overflow: 'hidden'
    },

    groupName: {
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: 700,
        marginLeft: '-2px',
        display: 'inline-block',
        marginTop: '3px',
        color: colors.primary
    },

    chevronButton: {
        marginBottom: '4px',
        marginRight: '21px',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },

    datasetChevronButton: {
        marginTop: '75px',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },

    chevronIcon: {
        transform: 'scale(0.8)'
    },

    datasetButtonWrapper: {
        width: '70px',
        display: 'inline-block'
    },

    datasetName: {
        marginTop: '-32px',
        // marginBottom: '12px',
        fontSize: '19px',
        marginBottom: '-48px',
        fontWeight: 700
    },

    tableGridSection: {
        padding: '8px 8px 0 8px',
        marginBottom: '-24px'
    },

    shortCell: {
        maxWidth: '35%',
        width: '35%'
    },

    acknowledgement: {
        fontSize: '11px',
        textAlign: 'center',
        padding: '0 10px 0 10px',
        maxWidth: '20vw',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        maxHeight: '100px'
    },

    acknowledgementHeader: {
        padding: '0 6px 0 6px',
        maxWidth: '20vw',
        fontSize: '13px',
        overflow: 'hidden',
        whiteSpace: 'normal',
        textAlign: 'center',
        marginBottom: '8px'
    },

    buttonMarginLeft: {
        marginLeft: '60px',
    },

    buttonMarginTop: {
        marginTop: '36px',
        marginLeft: '20px'
    }
})

const GroupedDatasetRow = (props) => {
    const { classes, node, context, value } = props;
    const { data } = node.allLeafChildren[0];

    const [expanded, setExpanded] = React.useState(node.expanded);

    const toggleExpand = () => {
        node.setExpanded(!node.expanded)
        setExpanded(node.expanded);
    }
    
    if(props.node.field === 'Dataset_Name') {    
        return (
            <div className={`ag-selectable ${classes.datasetGroupWrapper}`}>            
                <Grid container className={classes.datasetGridClass}>
                    <Grid xs={1} item className={classes.datasetButtonWrapper}>
                        {expanded ? 
                            <IconButton onClick={toggleExpand} size='small' className={`${classes.datasetChevronButton}`}>
                                <ExpandMore className={classes.chevronIcon}/>
                            </IconButton> 
                        :

                            <IconButton onClick={toggleExpand} size='small' className={`${classes.datasetChevronButton}`}>
                                <ChevronRight className={classes.chevronIcon}/>
                            </IconButton>                
                        }
                    </Grid>

                    <Grid item container xs={11} className={`${classes.gridItem} ${classes.adjustGridLeft}`}>
                        <Grid item xs={4} className={classes.gridItem}>
                            <img src={context.datasets[props.value].Icon_URL} alt="Mission Icon" className={classes.vizSampleImage} onClick={toggleExpand}/>
                        </Grid>

                        <Grid justify='space-between' direction='column' container item xs={8} className={classes.gridItem}>
                            <Grid container item xs={12}>
                                <Typography className={classes.datasetName}>
                                    {value}
                                </Typography>
                            </Grid>

                            <Grid container item xs={12}>
                                <Grid item xs={8} className={classes.tableGridSection}>
                                    <Table className={classes.variableDetailTable} size='small'>
                                            <TableBody>
                                                <TableRow className={classes.variableDetailTableRow}>
                                                    <TableCell className={`${classes.variableDetailTableCell} ${classes.shortCell}`}><strong>Source</strong></TableCell>
                                                    <TableCell className={classes.variableDetailTableCell} title={data.Data_Source}>{data.Data_Source}</TableCell>
                                                </TableRow>

                                                <TableRow className={classes.variableDetailTableRow}>
                                                    <TableCell className={`${classes.variableDetailTableCell} ${classes.shortCell}`}><strong>Distributor</strong></TableCell>
                                                    <TableCell className={classes.variableDetailTableCell} title={data.Distributor}>{data.Distributor}</TableCell>
                                                </TableRow>

                                                <TableRow className={classes.variableDetailTableRow}>
                                                    <TableCell className={`${classes.variableDetailTableCell} ${classes.shortCell}`}>SQL Table</TableCell>
                                                    <TableCell className={classes.variableDetailTableCell} title={data.Distributor}>{data.Table_Name}</TableCell>
                                                </TableRow>

                                                <TableRow className={classes.variableDetailTableRow}>
                                                    <TableCell className={`${classes.variableDetailTableCell} ${classes.shortCell}`}>Temporal Resolution</TableCell>
                                                    <TableCell className={classes.variableDetailTableCell} title={data.Distributor}>{data.Temporal_Resolution}</TableCell>
                                                </TableRow>

                                                <TableRow className={classes.variableDetailTableRow}>
                                                    <TableCell className={`${classes.variableDetailTableCell} ${classes.shortCell}`}>Spatial Resolution</TableCell>
                                                    <TableCell className={classes.variableDetailTableCell} title={data.Distributor}>{data.Spatial_Resolution}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                    </Table>
                                </Grid>

                                <Grid item xs={4} container direction='column' className={classes.tableGridSection}>
                                    <Grid item xs={12}></Grid>
                                    { data.Acknowledgement &&
                                        <div style={{height: '70%', justifyContent: 'center'}}>
                                            <Typography className={classes.acknowledgementHeader}>
                                                <strong>Acknowledgement:</strong>
                                            </Typography>

                                            <Typography title={data.Acknowledgement} className={classes.acknowledgement}>
                                                {data.Acknowledgement}
                                            </Typography>                                            
                                        </div>
                                    }

                                        <div style={{height: '30%', justifyContent: 'center'}}>
                                            <Button 
                                                variant='contained'
                                                className={`${classes.datasetDescriptionButton} ${data.Acknowledgement ? classes.buttonMarginLeft : classes.buttonMarginTop}`} 
                                                onClick={() => props.context.handleDescribeDataset(data.Dataset_Name)}
                                            >
                                                <span className={classes.buttonTextWrapper}>Dataset Details</span>
                                            </Button>
                                        </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
    else return (
        <div className={`ag-selectable ${classes.nonDatasetGroupWrapper}`}>
            <div style={{display: 'inline-block', marginLeft: `${node.level * 36}px`}}></div>
            {expanded ? 
                <IconButton onClick={toggleExpand} size='small' className={`${classes.chevronButton}`}>
                    <ExpandMore className={classes.chevronIcon}/>
                </IconButton> 
            :

                <IconButton onClick={toggleExpand} size='small' className={`${classes.chevronButton}`} disableRipple={true} disableFocusRipple={true}>
                    <ChevronRight className={classes.chevronIcon}/>
                </IconButton>                
            }

            <Typography className={classes.groupName} variant='h6'>
                {props.value}
            </Typography>
        </div>
    )
}

export default (withStyles(styles)(GroupedDatasetRow));