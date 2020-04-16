import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Link } from '@material-ui/core';

const styles = (theme) => ({
    root: {
        marginTop: '70px',
        display: 'flex'
    },

    descriptionPaper: {
        padding: '6vh 6vw',
        margin: '110px 10vw 0px 10vw'
    },
})

const DataSubmissionTemp = (props) => {
    const { classes } = props;

    return (
        <div className={classes.root}>
            <Paper className={classes.descriptionPaper} elevation={8}>
                <Typography variant='body1'>
                    If you wish to suggest a dataset be added to the database or have some data that you would like added, an overview of our data submission process can be found <Link target='_blank' href='https://cmap.readthedocs.io/en/latest/faq_and_contributing/datasubmission.html'>here</Link>.
                </Typography>

            </Paper>
        </div>
    )
}

export default withStyles(styles)(DataSubmissionTemp);