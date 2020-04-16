import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Typography, Paper, Button } from '@material-ui/core';

const datasetRequirements = {
    dataset_short_name: {
        required: true,
        minLength: null,
        maxLength: 50
    },

    dataset_long_name: {
        required: true,
        minLength: null,
        maxLength: 130
    },

    dataset_version: {
        required: false,
        minLength: null,
        maxLength: 50
    },

    dataset_release_date: {
        required: false,
        minLength: null,
        maxLength: null
        // check for valid date
    },

    dataset_make: {
        required: true,
        minLength: null,
        maxLength: null,
        // Must be one of assimilation, model, observation
    },

    dataset_source: {
        required: true,
        minLength: null,
        maxLength: 50
    },

    dataset_doi: {
        required: true,
        minLength: null,
        maxLength: 50
    },

    dataset_history: {
        required: true,
        minLength: null,
        maxLength: 50
    },

    dataset_description: {
        required: true,
        minLength: null,
        maxLength: 50
    },

    dataset_references: {
        required: true,
        minLength: null,
        maxLength: 50
    }
}

const variableRequirements = {
    var_short_name: {
        required: true,
        minLength: null,
        maxLength: 50
        // regex to detect code friendliness
        // Pycmap illegal variable name check (no starting num, no spaces, no illegal chars)
    },

    var_long_name: {
        required: true,
        minLength: null,
        maxLength: 200
        // review max length of this
    },

    var_standard_name: {
        required: true,
        minLength: null,
        maxLength: 50
        // this column is probably not going to be used
    },

    var_sensor: {
        required: true,
        minLength: null,
        maxLength: null
        // must be an existing option, info to contact us if not on list
    },

    var_spatial_resolution: {
        required: true,
        minLength: null,
        maxLength: null
        // must be an existing option, info to contact us if not on list
    },

    var_temporal_resolution: {
        required: true,
        minLength: null,
        maxLength: null
        // must be an existing option, info to contact us if not on list
    },

    var_missing_value: {
        required: false,
        minLength: null,
        maxLength: null
    },

    var_discipline: {
        required: true,
        minLength: null,
        maxLength: null
        // must be an existing option, info to contact us if not on list
    },

    var_keywords: {
        required: true,
        minLength: null,
        maxLength: null
        // detailed review of this
    },

    var_comment: {
        required: false,
        minLength: null,
        maxLength: null
    },

    var_visualizable: {
        required: false,
        minLength: null,
        maxLength: null
        // work out how to ask this
    }
}

const styles = (theme) => ({
    paper: {
        width: '40vw',
        height: '30vh',
        margin:'40px auto'
    },

    dragTarget: {
        border: '1px solid red',
        width: '100px',
        height: '100px',
        margin:'40px auto'
    },

    input: {
        display: 'none'
    }
})

class ValidationTool extends React.Component {

    state = {
        file: null
    }
    
    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
    }

    render = () => {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Paper className={classes.paper}>
                    <input
                        accept="image/*"
                        className={classes.input}
                        id="contained-button-file"
                        type="file"
                    />
                    <label htmlFor="contained-button-file">
                        <Button variant="contained" color="primary" component="span">
                        Upload
                        </Button>
                    </label>

                    <div 
                        className={classes.dragTarget}
                        onDrop={this.handleDrop}
                        onDragOver={this.handleDragOver}             
                    >
    
                    </div>
                </Paper>
            </React.Fragment>
        )
    }
}

export default withStyles(styles)(ValidationTool);