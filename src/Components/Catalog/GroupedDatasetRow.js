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
        height: '90px',
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

const GroupedDatasetRow = (props) => {
    const {classes} = props;
    
    console.log(props);

    // return (props.api.cellRendererFactory.cellRendererMap.group(props));

    return (
        <div className={`ag-selectable ${classes.wrapper}`}>
            <h1>{props.value}</h1>
        </div>
    )
}

export default (withStyles(styles)(GroupedDatasetRow));