import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

import ReactMarkdown from 'react-markdown';

const styles = (theme) => ({
    markdown: {
        '& img': {
            maxWidth: '100%',
            margin: '20px auto 20px auto',
            display: 'block'
        },
        '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none'
        }
    }
})

const DatasetDescriptionDialog = (props) => {
    const { description, classes } = props;
    return (
        <React.Fragment>
            { description ?
            <Dialog open={Boolean(description)} onClose={props.clearDescription} maxWidth={false}>
                <DialogTitle>{props.datasetName}</DialogTitle>
                <DialogContent>
                    <ReactMarkdown source={description} className={classes.markdown}/>
                </DialogContent>
            </Dialog> :
            ''
            }
        </React.Fragment>
    )
}

export default (withStyles(styles)(DatasetDescriptionDialog));