import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core';
import { Grid, AccordionDetails, TableRow, TableCell, Table, TableBody, Typography } from '@material-ui/core';

import ReactMarkdown from 'react-markdown/with-html';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    table: {
        maxWidth: '800px',
        marginLeft: '24px',
        marginBottom: '36px',
        captionSide: 'top'
    },

    sampleTableRow: {
        '& td':{
            padding: '6px 24px 6px 12px',
            fontSize: '.8rem'
        }
    },

    smallText: {
        fontSize: '.8rem'
    },

    tableHead: {
        fontWeight: 600
    },

    tableLabel: {
        fontSize: '1rem',
        padding: '8px 24px 6px 0',
        fontWeight: 600,
        border: 'none'
    },

    tableWrapper: {
        paddingRight: '24px'
    },

    markdown: {

        marginLeft: '24px',

        '& td:not(:first-child)': {
            paddingLeft: '8px'
        },

        '& td, th': {
            padding: '6px 0'
        },

        '& th:not(:first-child)': {
            paddingLeft: '8px'
        },

        '& tr': {
            borderBottom: '1px solid black'
        },

        '& table': {
            borderCollapse: 'collapse'
        }
    }
});

const VariableDetails = (props) => {
    const { variable, classes } = props;
    const { 
        Depth_Min, 
        Depth_Max, 
        Lat_Min, 
        Lat_Max, 
        Lon_Min, 
        Lon_Max, 
        Sensor, 
        Time_Min, 
        Time_Max, 
        Unit, 
        Variable,
        Variable_Mean,
        Variable_25th, 
        Variable_50th, 
        Variable_75th, 
        Variable_Count, 
        Variable_Max, 
        Variable_Min, 
        Variable_STD,
        Comment
    } = variable;

    return (
        <AccordionDetails style={{display: 'block'}}>
            <Grid container>
                <Grid item xs={12} className={classes.tableWrapper}>
                    <Table className={classes.table}>
                        <TableBody>
                            <TableRow>
                                <TableCell className={classes.tableLabel}>
                                    General Information
                                </TableCell>
                            </TableRow>

                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Sensor
                                </TableCell>
                                <TableCell>
                                    {Sensor}
                                </TableCell>
                            </TableRow>

                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Unit
                                </TableCell>
                                <TableCell>
                                    {Unit}
                                </TableCell>
                            </TableRow>

                            <TableRow className={classes.sampleTableRow} style={{width: '100%'}}>
                                <TableCell className={classes.tableHead}>
                                    Database Variable Name
                                </TableCell>
                                <TableCell>
                                    {Variable}
                                </TableCell>
                            </TableRow>
                        </TableBody>  
                    </Table>
                </Grid>
            
            
            <Grid item xs={12} lg={6} className={classes.tableWrapper}>
                <Table className={classes.table}>
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.tableLabel}>
                                Coverage
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Time Start
                            </TableCell>
                            <TableCell>
                                {Time_Min ? Time_Min.slice(0, 10) : 'NA'}
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Time End
                            </TableCell>
                            <TableCell>
                                {Time_Max ? Time_Max.slice(0, 10) : 'NA'}
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Lat Start
                            </TableCell>
                            <TableCell>
                                {Lat_Min}&deg;
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Lat End
                            </TableCell>
                            <TableCell>
                                {Lat_Max}&deg;
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Lon Start
                            </TableCell>
                            <TableCell>
                                {Lon_Min}&deg;
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Lon End
                            </TableCell>
                            <TableCell>
                                {Lon_Max}&deg;
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Depth Start
                            </TableCell>
                            <TableCell>
                                {Depth_Max ? Depth_Min + 'm' : 'Surface Only'}
                            </TableCell>
                        </TableRow>

                        <TableRow className={classes.sampleTableRow}>
                            <TableCell className={classes.tableHead}>
                                Depth End
                            </TableCell>
                            <TableCell>
                                {Depth_Max ? Depth_Max + 'm' : 'Surface Only'}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Grid>

            {
                [Variable_Mean, Variable_STD, Variable_Min, Variable_MAX, Variable_25th, Variable_50th, Variable_75th, Variable_Count].some(e => Boolean(e)) ?

                <Grid item xs={12} lg={6} className={classes.tableWrapper}>
                <Table className={classes.table}>
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.tableLabel}>
                                Variable Statistics
                            </TableCell>
                        </TableRow>
                        
                        {   
                            Variable_Mean || Variable_Mean === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Mean Value
                                </TableCell>
                                <TableCell>
                                    {Variable_Mean}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {
                            Variable_STD || Variable_STD === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Standard Deviation
                                </TableCell>
                                <TableCell>
                                    {Variable_STD}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {
                            Variable_Min || Variable_Min === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Minimum Value
                                </TableCell>
                                <TableCell>
                                    {Variable_Min}
                                </TableCell>
                            </TableRow>
                            : ''
                        }
                        
                        {   
                            Variable_Max || Variable_Max === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Maximum Value
                                </TableCell>
                                <TableCell>
                                    {Variable_Max}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {   
                            Variable_25th || Variable_25th === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    25th Quantile
                                </TableCell>
                                <TableCell>
                                    {Variable_25th}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {
                            Variable_50th || Variable_50th === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    50th Quantile
                                </TableCell>
                                <TableCell>
                                    {Variable_50th}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {
                            Variable_75th || Variable_75th === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    75th Quantile
                                </TableCell>
                                <TableCell>
                                    {Variable_75th}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                        {
                            Variable_Count || Variable_Count === 0 ?
                            <TableRow className={classes.sampleTableRow}>
                                <TableCell className={classes.tableHead}>
                                    Database Row Count
                                </TableCell>
                                <TableCell>
                                    {Variable_Count}
                                </TableCell>
                            </TableRow>
                            : ''
                        }

                    </TableBody>
                </Table>
                </Grid>

                : ''
            }

            
                </Grid>

            {
                Comment ?
                <>
                    <Typography style={{marginBottom: '12px'}}>
                        Additional Information:
                    </Typography>
                    <ReactMarkdown source={Comment} className={classes.markdown}/>
                </> : ''
            }
            
        </AccordionDetails>
        )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VariableDetails));