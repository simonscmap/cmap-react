import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { SwapVert } from '@material-ui/icons';

const styles = theme => ({
    popover: {
        width: '470px',
        height: '110px',
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2.5),
        paddingRight: theme.spacing(2.5)
    },

        iconButtonWrapper: {
            display: 'inline-block'
        }

})

const ZValueControls = (props) => {

    const { classes, extent, zValues, handleZValueConfirm, disabled } = props;

    if(disabled){
        return (
            <Tooltip title='Change Colorscale Range'>
                <div className={classes.iconButtonWrapper}>
                <IconButton disabled>
                    <SwapVert/>
                </IconButton>
                </div>
            </Tooltip>
        )
    }

    const [popoverAnchorElement, setPopoverAnchorElement] = React.useState(null);
    const [localZMin, setLocalZMin] = React.useState(zValues[0]);
    const [localZMax, setLocalZMax] = React.useState(zValues[1]);

    const handleClose = () => {
        setPopoverAnchorElement(null);
    };

    const handleConfirm = () => {
        handleZValueConfirm([localZMin, localZMax]);
        handleClose();
    }

    const checkLocalZMin = () => {
        if(localZMin < extent[0]) return `Minimum value is ${extent[0]}`;
        if(localZMin > localZMax) return `Min must be higher than max`;
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMin)) return 'Invalid value';
    }

    const checkLocalZMax = () => {
        if(localZMax > extent[1]) return `Maximum value is ${extent[1]}`;
        if(localZMin > localZMax) return `Min must be higher than max`;
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMax)) return 'Invalid value';
    }

    const validations = [
        checkLocalZMin(),
        checkLocalZMax()
    ];

    const [
        zMinMessage,
        zMaxMessage
    ] = validations;

    const open = Boolean(popoverAnchorElement);
    const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <Tooltip title='Change Colorscale Range'>
                <IconButton disabled={disabled} color='secondary' onClick={(event) => setPopoverAnchorElement(event.currentTarget)}>
                    <SwapVert/>
                </IconButton>
            </Tooltip>

            <Popover
                id={id}
                open={open}
                anchorEl={popoverAnchorElement}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className={classes.popover}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                error={Boolean(zMinMessage)} 
                            >
                                <InputLabel htmlFor='z-min-input' >Min</InputLabel>
                                <OutlinedInput
                                    id='z-min-input'
                                    value={localZMin}
                                    onChange={(event) => setLocalZMin(event.target.value)}
                                    aria-describedby='local-zmin-error'
                                    labelWidth={50}
                                    name='local-zmin'
                                />
                                <FormHelperText id='local-zmin-error'>{zMinMessage}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                error={Boolean(zMaxMessage)} 
                            >
                                <InputLabel htmlFor='z-max-input' >Max</InputLabel>
                                <OutlinedInput
                                    id='z-max-input'
                                    value={localZMax}
                                    onChange={(event) => setLocalZMax(event.target.value)}
                                    aria-describedby="local-zmax-error"
                                    labelWidth={50}
                                    name='local-zmax'
                                />
                                <FormHelperText id="local-zmax-error">{zMaxMessage}</FormHelperText>
                            </FormControl>
                        </Grid> 

                        <Grid item xs={7}>
                        </Grid>

                        <Grid item xs={2}>
                            <Button onClick={handleClose}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid item xs={2}>
                            <Button 
                                color='primary'
                                onClick={handleConfirm}
                                disabled={Boolean(zMinMessage || zMaxMessage)}
                            >
                                Confirm
                            </Button>
                        </Grid> 

                        <Grid item xs={1}>
                        </Grid>

                    </Grid>                    
                </div>
            </Popover>

        </React.Fragment>
    )
}

export default withStyles(styles)(ZValueControls);