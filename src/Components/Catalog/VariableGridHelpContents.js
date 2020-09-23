import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Typography } from '@material-ui/core';

const VariableGridHelpContents = (props) => {

return (
    <React.Fragment>
        <Typography>
            This table contains information about the variables belonging to this dataset including general information,
            temporal and spatial coverage, and summary statistics.
        </Typography>

        <Typography style={{marginTop: '12px'}}>
            Enter a search term into the variable filter to quickly filter by variable name, sensor, or other keyword.
        </Typography>

        <img 
            src='/images/help_variable_grid_filter.png' 
            style={{
                margin: '20px auto',
                display: 'block',
                width: '480px',
                maxWidth: '80vw'
            }}
            alt='Using Quick Filter'
        />

        <Typography style={{marginTop: '12px'}}>
            Click any column header to sort the table by the values in that column. Click again to reverse the sort order.
        </Typography>

        <img 
            src='/images/help_variable_grid_sort.gif' 
            style={{
                margin: '20px auto',
                display: 'block',
                width: '400px',
                maxWidth: '80vw'
            }}
            alt='Multiple Keyword Example'
        />

        <Typography style={{marginTop: '12px'}}>
            To download the variable table in csv format right click on any cell and click CSV Export.
        </Typography>

        <img 
            src='/images/help_variable_grid_export.png' 
            style={{
                margin: '20px auto',
                display: 'block',
                width: '480px',
                maxWidth: '80vw'
            }}
            alt='Multiple Keyword Example'
        />
    </React.Fragment>
)
}

export default VariableGridHelpContents;