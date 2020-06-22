import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { Paper, Typography } from '@material-ui/core';

const styles = (theme) => ({
    sectionWrapper: {
        maxWidth: '80vw',
        margin: '24px auto',
        textAlign: 'left',
        padding: '12px'
    },

    error: {
        color: '#ff6328',
    },

    warning: {
        color: 'yellow'
    },

    success: {
        color: theme.palette.primary.main
    },

    sectionHeader: {
        fontSize: '1.15rem',
        marginBottom: '12px'
    }
})

const AuditReportSection = (props) => {
    const { title, report, classes } = props;
    const { warnings, errors, info } = report;

    return (
        <Paper elevation={4} className={classes.sectionWrapper}>
            <Typography variant='h6' className={classes.sectionHeader}>
                {title}:
            </Typography>

            {
                errors.map((err, i) => (
                    <Typography className={classes.error} key={i}>
                        {err}
                    </Typography>
                ))
            }

            {
                warnings.map((rec, i) => (
                    <Typography className={classes.warning} key={i}>
                        {rec}
                    </Typography>
                ))
            }

            {
                info.map((info, i) => (
                    <Typography key={i}>
                        {info}
                    </Typography>
                ))
            }

            {
                errors.length === 0 && 

                <Typography className={classes.success}>
                    Audit passed without errors.
                </Typography>
            }
        </Paper>
    )
}

export default withStyles(styles)(AuditReportSection);