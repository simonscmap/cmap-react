import React from 'react';

import { Autocomplete } from '@material-ui/lab';
import { TextField, MenuItem, Popper, Grow, ClickAwayListener, Link, Paper } from '@material-ui/core';

import regions from '../../Enums/regions';

// takes onSelect prop
// takes buttonClass prop
// takes listClass prop
// takes inputClass prop
const RegionSelector = (props) => {

    // const [ anchorEl, setAnchorEl ] = React.useState(null);

    // const handleClose = () => {
    //     setAnchorEl(null);
    // };

    const handleChange = (event, option) => {
        props.onSelect(option)
        // handleClose();
    }

    // const handleButtonLinkClick = (e) => {
    //     setAnchorEl(e.currentTarget);
    // }
    
    return (
        <React.Fragment>
            {/* <Link
                component='button'
                onClick={handleButtonLinkClick}
            >
                Select Named Region
            </Link>

            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition placement='right-end'>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper className={props.paperClass} style={{width: '300px'}}>
                            <ClickAwayListener onClickAway={handleClose}> */}
            <Autocomplete
                options={regions}
                renderInput={(params) => <TextField margin='none' {...params} label="Ocean Region" InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>}
                getOptionLabel={(option) => option.label}
                onChange={handleChange}
                disablePortal
                classes={{
                    paper: props.paperClass,
                    input: props.inputClass,
                    option: props.optionClass
                }}
            />
                            {/* </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>             */}
        </React.Fragment>
    )
}

export default RegionSelector;