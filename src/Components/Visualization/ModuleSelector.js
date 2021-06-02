// Popup appearing at /visualization to direct to cruises or plots

import React from 'react';
import { withRouter } from 'react-router-dom';

import { withStyles, Dialog, DialogContent, DialogTitle, Button } from '@material-ui/core';

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: 'black',
        width: '400px',
        height: '180px'
    },

    button: {
        textTransform: 'none',
        marginLeft: '20px',
        marginTop: '24px'
    },
});

const ModuleSelector = (props) => {
    const { history, classes } = props;
    
    return (
        <React.Fragment>
            <Dialog 
                open
                PaperProps={{
                    className: classes.dialogPaper
                }}
            >
                <DialogTitle>
                    Select a Visualization Module
                </DialogTitle>

                <DialogContent>
                    <Button
                        variant='outlined'
                        onClick={() => history.push('/visualization/charts')}
                        className={classes.button}
                        color='primary'
                    >
                        Charts and Plots
                    </Button>

                    <Button
                        variant='outlined'
                        onClick={() => history.push('/visualization/cruises')}
                        color='primary'
                        className={classes.button}
                    >
                        Explore Cruises
                    </Button>
                </DialogContent>
            </Dialog>
        </React.Fragment>
        )
    }

export default withStyles(styles)(withRouter(ModuleSelector));