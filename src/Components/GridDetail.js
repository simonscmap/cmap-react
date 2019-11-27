import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
// import Card from '@material-ui/core/Card';
// import Divider from '@material-ui/core/Divider';

import { withStyles } from '@material-ui/core/styles';

import { apiUrl } from '../config';

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
        height: '100%'
    },
    infoCard: {
        padding: theme.spacing(1),
        width: '100%',
        height: '100%'
    },
    gridClass: {
        height: '100%'
    },
    gridItem: {
        // height: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle'
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
        maxWidth: '90%',
        maxHeight: '90%'
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
    }
})

const GridDetail = (props) => {

    const {classes} = props;

    return (
        <div className={classes.wrapper}>
            <Grid>
                <Grid container item xs={10}>
                    <Grid container spacing={2} className={classes.gridClass}>
                        <Grid item xs={4} className={classes.gridItem}>
                            <img src={props.context.datasets[props.data.Dataset_Name].Icon_URL} alt="Mission Icon" className={classes.vizSampleImage}/>
                        </Grid>

                        <Grid item xs={4} className={classes.gridItem}>
                            <Table className={classes.variableDetailTable} size='small'>
                                <TableBody>
                                    {tableMapping1.map((row, index) => (
                                        <TableRow key={index} className={classes.variableDetailTableRow}>
                                            <TableCell className={classes.variableDetailTableCell}>{row[0]}</TableCell>
                                            <TableCell className={classes.variableDetailTableCell}>{props.data[row[1]]}</TableCell>
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
                    <Grid container item xs={2}>

                    </Grid>

                </Grid>

            </Grid>
        </div>
    )
}

export default (withStyles(styles)(GridDetail));