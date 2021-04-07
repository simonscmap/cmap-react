import React from 'react';

import { connect } from 'react-redux';
import { Dialog, DialogContent, Typography, List, ListItem, withStyles } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import z from '../../Enums/zIndex';
import colors from '../../Enums/colors';

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

    lastPointValueText: {
        fontSize: '13px'
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

    list: {
        padding: '0px 0px 0px 24px'
    },

    listItem: {
        fontSize: '13px',
        padding: '3px 0px 2px 24px'
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
                <Typography>
                    The data requested exceeds the maximum retrievable amount. A visualization has been created from a subset of the data*.
                    If this does not include your data of interest, please reduce the range of the parameters in the control panel and create another visualization.
                </Typography>

                <div className={classes.lastPointValueWrapper}>
                    <Typography className={classes.lastPointValueText}>
                        *The visualized data is based upon parameters specified in the control panel and includes:
                    </Typography>
                    <List className={classes.list}>
                        <ListItem className={classes.listItem}>
                            {'\xb7'}All times before {time.replace('T', ' ').replace('Z', '')} UTC
                        </ListItem>

                        <ListItem className={classes.listItem}>
                        {'\xb7'}Where time is exactly {time.replace('T', ' ').replace('Z', '')}:
                        </ListItem>

                        <ListItem>
                            <List className={classes.list}>
                                <ListItem className={classes.listItem}>
                                {'\xb7'}All latitudes before {lat}{'\xb0'}
                                </ListItem>

                                <ListItem className={classes.listItem}>
                                {'\xb7'}Where latitude is exactly {lat}{'\xb0'}:
                                </ListItem>

                                <ListItem>
                                    <List className={classes.list}>
                                        <ListItem className={classes.listItem}>
                                        {'\xb7'}All longitudes before {lon}{'\xb0'}
                                        </ListItem>

                                        <ListItem className={classes.listItem}>
                                        {'\xb7'}Where longitude is exactly {lon}{'\xb0'}:
                                        </ListItem>

                                        <ListItem>
                                            <List className={classes.list}>
                                                <ListItem className={classes.listItem}>
                                                {'\xb7'}All depths up to and including {depth}[m]
                                                </ListItem>
                                            </List>
                                        </ListItem>
                                    </List>
                                </ListItem>
                            </List>
                        </ListItem>
                    </List>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SparseDataMaxSizeNotification));