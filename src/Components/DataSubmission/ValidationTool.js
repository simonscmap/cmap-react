import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Typography } from '@material-ui/core';

const styles = (theme) => ({

})

const ValidationTool = (props) => {

    const { classes } = props;
    return (
        <React.Fragment>
            <Typography variant='h1'>
                Validation Tool
            </Typography>
        </React.Fragment>
    )
}

export default withStyles(styles)(ValidationTool);