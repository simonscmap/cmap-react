import React from 'react';

import { connect } from 'react-redux';
import { Dialog, DialogContent, Typography, withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import z from '../../Enums/zIndex';
import colors from '../../Enums/colors';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../Enums/sparseDataQueryMaxSize';

import { sparseDataMaxSizeNotificationUpdate } from '../../Redux/actions/visualization';

const mapStateToProps = (state, ownProps) => ({
    sparseDataMaxSizeNotificationData: state.sparseDataMaxSizeNotificationData
});

const mapDispatchToProps = {
    sparseDataMaxSizeNotificationUpdate
}

const styles = theme => ({
    dialogPaper: {
        backgroundColor: colors.backgroundGray,
        minWidth: '700px',
        maxWidth: '60vw',
    },

    dialogContent: {
        padding: '20px 20px 12px 20px'
    },

    dialogContentText: {
        fontSize: '14px',
    },

    lastPointValueText: {
        fontSize: '12px'
    },

    lastPointValueWrapper: {
        backgroundColor: 'rgba(0, 0, 0, .15)',
        padding: '8px',
        margin: '12px 0'
    },

    closeIcon: {
        fontSize: '20px',
        color: 'white',
        cursor: 'pointer',
        position: 'absolute',
        top: 2,
        right: 2
    },

    footNote: {
        fontSize: '12px',
        marginTop: '4px'
    }
})

const SparseDataMaxSizeNotification = (props) => {
    const { sparseDataMaxSizeNotificationUpdate, sparseDataMaxSizeNotificationData, classes } = props;
    if(sparseDataMaxSizeNotificationData === null) return '';
    const { time, lat, lon, depth } = sparseDataMaxSizeNotificationData;

    const handleClose = () => sparseDataMaxSizeNotificationUpdate(null);

    return(
        <Dialog
            onClose={handleClose}
            open={Boolean(sparseDataMaxSizeNotificationData)}
            style={{zIndex: z.NON_HELP_DIALOG}}
            PaperProps={{
                className: classes.dialogPaper
            }}
        >
            <Close className={classes.closeIcon} onClick={handleClose}/>

            <DialogContent className={classes.dialogContent}>
                <Typography className={classes.dialogContentText}>
                    The data requested was larger than the maximum retrievable amount. A visualization has been created from the
                    first {SPARSE_DATA_QUERY_MAX_SIZE} data points.The final retrieved data point was at:
                </Typography>

                <div className={classes.lastPointValueWrapper}>
                    <Typography className={classes.lastPointValueText}>Time: {time.replace('T', ' ').replace('Z', '')} UTC</Typography>
                    <Typography className={classes.lastPointValueText}>Lat: {lat}{'\xb0'}</Typography>
                    <Typography className={classes.lastPointValueText}>Lon: {lon}{'\xb0'}</Typography>
                    {depth !== undefined ? <Typography className={classes.lastPointValueText}>Depth: {depth}m</Typography> : ''}
                </div>

                <Typography className={classes.dialogContentText}>
                    Data beyond this point is not included in the visualization*.
                </Typography>

                <Typography className={classes.footNote}>
                    *Data is ordered by time, then lat, then lon, then depth.
                </Typography>
            </DialogContent>
        </Dialog>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SparseDataMaxSizeNotification));

