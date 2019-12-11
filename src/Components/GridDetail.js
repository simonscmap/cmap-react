import React from 'react';

import { Typography, Grid, Table, TableBody, TableCell, TableRow, Button } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

const tableMapping1 = [
    ['Long Name', 'Long_Name'],
    ['Short Name', 'Variable'],
    ['Dataset Name', 'Dataset_Name'],
    ['Study Domain', 'Study_Domain'],
    ['Process Level', 'Process_Level'],
    ['SQL Table Name', 'Table_Name'],
    ['Temporal Resolution', 'Temporal_Resolution']
];

const tableMapping2 = [
    ['Unit', 'Unit'],
    ['Mean Value', 'Variable_Mean'],
    ['Value Std', 'Variable_Std'],
    ['Spatial Resolution', 'Spatial_Resolution'],
    ['Start Latitude[\xb0]', 'Lat_Min'],
    ['End Latitude[\xb0]', 'Lat_Max'],
    ['Start Longitude[\xb0]', 'Lon_Min'],
    ['End Longitude[\xb0]', 'Lon_Max']
];

const styles = (theme) => ({
    title:{
        marginBottom: theme.spacing(1)
    },
    wrapper: {
        // width: '90%',
        // margin: '0px auto 5px 10px',
        padding: '10px',
        height: '100%',
        userSelect: 'auto'
    },
    infoCard: {
        padding: theme.spacing(1),
        width: '100%',
        height: '100%'
    },
    gridClass: {
        height: '100%',
        maxHeight: '280px'
    },
    gridItem: {
        // height: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        maxHeight: '280px'
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
        maxHeight: '260px'
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
        backgroundColor: '#FF8000',
        color: 'white',
        '&:hover': {
            backgroundColor: '#ab5600',
        },
        fontSize: '12px',
        maxWidth: '100%',
    },
    
    buttonTextWrapper: {
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        overflow: 'hidden'
    }
})

const GridDetail = (props) => {
    const {classes} = props;

    return (
        <div className={`ag-selectable ${classes.wrapper}`}>
                <Grid container className={classes.gridClass}>
                    <Grid container item xs={10} spacing={2}>
                        <Grid item xs={4} className={classes.gridItem}>
                            <img src={props.context.datasets[props.data.Dataset_Name].Icon_URL} alt="Mission Icon" className={classes.vizSampleImage}/>
                        </Grid>

                        <Grid item xs={4} className={classes.gridItem}>
                            <Table className={classes.variableDetailTable} size='small'>
                                <TableBody>
                                    {tableMapping1.map((row, index) => (
                                        <TableRow key={index} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>{row[0]}</TableCell>
                                            <TableCell className={classes.variableDetailTableCell} title={props.data[row[1]]}>{props.data[row[1]]}</TableCell>
                                        </TableRow>
                                    ))}
                                        <TableRow key={tableMapping1.length + 1} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>Start Date</TableCell>
                                            <TableCell className={classes.variableDetailTableCell}>{props.data.Time_Min.slice(0,10)}</TableCell>
                                        </TableRow>
                                        <TableRow key={tableMapping1.length + 2} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>End Date</TableCell>
                                            <TableCell className={classes.variableDetailTableCell}>{props.data.Time_Max.slice(0,10)}</TableCell>
                                        </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>

                        <Grid item xs={4} className={classes.gridItem}>
                            <Table className={classes.variableDetailTable} size='small'>
                                <TableBody>
                                    {tableMapping2.map((row, index) => (
                                        <TableRow key={index} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>{row[0]}</TableCell>
                                            <TableCell className={classes.variableDetailTableCell}>{props.data[row[1]]}</TableCell>
                                        </TableRow>
                                    ))}
                                        <TableRow key={tableMapping2.length + 1} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>Maximum Depth[m]</TableCell>
                                            <TableCell className={classes.variableDetailTableCell}>{props.data.Depth_Max || 'Surface Only'}</TableCell>
                                        </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>

                <Grid container direction='column' item xs={2} alignContent='center' alignItems='center'>

                    <Grid item xs={props.data.Acknowledgement ? 3 : 6} className={classes.rightGridItem}>
                        <Button 
                            variant='contained' 
                            className={classes.datasetDescriptionButton} 
                            onClick={() => props.context.handleDescribeDataset(props.data.Dataset_Name)}
                        >
                            <span className={classes.buttonTextWrapper}>Dataset Details</span>
                        </Button>
                    </Grid>

                    <Grid item xs={props.data.Acknowledgement ? 3 : 6} className={classes.rightGridItem}>
                        <Button 
                            variant='contained' 
                            className={classes.datasetDescriptionButton} 
                            onClick={() => props.context.handleDescribeVariable(props.data.ID)}
                        >
                            <span className={classes.buttonTextWrapper}>Variable Details</span>
                        </Button>
                    </Grid>
                    {   props.data.Acknowledgement &&
                        <Grid item xs={6} className={classes.rightGridItem}>
                            <Typography variant='caption' className={`${classes.gridDetailTypography} ${classes.boldText}`}>
                                Acknowlegement:
                            </Typography>
                            <Typography variant='caption' className={classes.gridDetailTypography} title={props.data.Acknowledgement}>
                                {props.data.Acknowledgement}
                            </Typography>
                        </Grid>
                    }
                </Grid>

            </Grid>
        </div>
    )
}

export default (withStyles(styles)(GridDetail));