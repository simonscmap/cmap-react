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

const imageSource = apiUrl + '/images/catalog/'

const tableMapping = [
    ['Variable Name', 'Variable'],
    ['Spatial Resolution', 'Spatial_Resolution'],
    ['Temporal Resolution', 'Temporal_Resolution'],
    ['Unit', 'Unit'],
    ['Process Level', 'Process_Level'],
    ['Study Domain', 'Study_Domain'],
    ['SQL Table Name', 'Table_Name']
]

const styles = (theme) => ({
    title:{
        marginBottom: theme.spacing(1)
    },
    wrapper: {
        width: '90%',
        margin: '-10px auto 0px auto',
        height: '100%'
    },
    infoCard: {
        padding: theme.spacing(2),
        width: '100%',
        height: '100%'
    },
    gridClass: {
        marginTop: theme.spacing(2),
        height: '100%'
    },
    gridItem: {
        height: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
        width: '90%'
    },
    variableDetailTable: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
    },
    variableDetailTableRow: {
        height: '32px'
    },
    variableDetailTableCell: {
        color: '#FFF6EC',
        borderBottomColor: 'black'
    }
})

const GridDetail = (props) => {
    const {classes} = props;
    return (
        <div className={classes.wrapper}>
            <Grid container spacing={8} className={classes.gridClass}>
                <Grid item xs={3} className={classes.gridItem}>
                    <img src={imageSource + 'viz_sample.png'} alt="Sample Visualization" className={classes.vizSampleImage}/>
                </Grid>
                <Grid item xs={4} className={classes.gridItem}>
                    <div className={classes.datasetDescriptionWrapper}>
                        <Typography variant='body2' className={classes.datasetDescription}>
                            {props.data.Dataset_Description}
                        </Typography>
                        <Typography variant='caption'>
                            Source: {props.data.Data_Source}
                        </Typography> <br></br>
                        <Typography variant='caption'>
                            Distributor: {props.data.Distributor}
                        </Typography>
                    </div>
                </Grid>
                <Grid item xs={5} className={classes.gridItem}>
                    <Table className={classes.variableDetailTable} size='small'>
                        <TableBody>
                            {tableMapping.map((row, index) => (
                                <TableRow key={index} className={classes.variableDetailTableRow}>
                                    <TableCell className={classes.variableDetailTableCell}>{row[0]}</TableCell>
                                    <TableCell className={classes.variableDetailTableCell}>{props.data[row[1]]}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        </div>
    )
}

export default (withStyles(styles)(GridDetail));