import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Paper, Tooltip, IconButton, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@material-ui/core';
import { Sync } from '@material-ui/icons';

import generateVariableFullRangeParams from '../../Utility/Visualization/generateVariableFullRangeParams';
import generateVariableSampleRangeParams from '../../Utility/Visualization/generateVariableSampleRangeParams';

import colors from '../../Enums/colors';

const styles = (theme) => ({
    popoutButtonPaper: {
        position: 'absolute',
        display: 'flex',
        borderRadius: '2px',
        boxShadow: '2px 2px  2px 2px #242424',
        backgroundColor: colors.backgroundGray
    },

    popoutButtonIcon: {
        width: '24px',
        height: '24px'
    },

    popoutButtonBase: {
        padding: '9px'
    },

    popperPaper: {
        backgroundColor: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(5px)',
    },

    dropdown: {
        zIndex: 40000,
        top: '28px !important',
        left: '22px !important',
        // width: '200px'
    },
});

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts,
    vizPageDataTargetDetails: state.vizPageDataTargetDetails
});

const mapDispatchToProps = {

};

const StoredParametersDropdown = (props) => {
    const { classes, charts, handleUpdateParameters, vizPageDataTargetDetails } = props;

        const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpenMenu = e => {
        setAnchorEl(e.currentTarget);
    };

    const handleCloseMenu = e => {
        setAnchorEl(null);
    }

    const handleSelect = (params) => {
        handleUpdateParameters(params);
        handleCloseMenu();
    }

    const syncPlotParams = chart => {
        const { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2 } = chart.data.parameters;
        
        return {
            lat1, lat2, lon1, lon2, depth1, depth2,
            dt1: dt1 ? dt1.slice(0, 10) : '1900-01-01', 
            dt2: dt2 ? dt2.slice(0, 10) : '1900-01-01'
        };
    }

    return (
        <>
            <Paper className={classes.popoutButtonPaper} style={{left: 281, top: '250px'}}>
                <Tooltip title='Sync Parameters'>
                    <span>
                        <IconButton 
                            className={classes.popoutButtonBase}
                            disabled={props.disableButton}
                        >
                            <Sync onClick={handleOpenMenu} className={classes.popoutButtonIcon}/>                                            
                        </IconButton>
                    </span>
                </Tooltip>
            </Paper>

            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition className={classes.dropdown} placement='right'>
                {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper className={classes.popperPaper}>
                            <ClickAwayListener onClickAway={handleCloseMenu}>
                                <MenuList>
                                    <MenuItem onClick={() => handleSelect(generateVariableSampleRangeParams(vizPageDataTargetDetails))}>Sync to Variable Sample Range</MenuItem>
                                    <MenuItem onClick={() => handleSelect(generateVariableFullRangeParams(vizPageDataTargetDetails))}>Sync to Variable Full Range</MenuItem>
                                    <MenuItem>Sync to Cruise: Cruise Name (this doesn't work yet)</MenuItem>
                                    {
                                        charts.map(e => (
                                            <MenuItem onClick={() => handleSelect(syncPlotParams(e))} key={e.id}>{'Sync to ' + e.subType + ': ' + e.data.metadata.Long_Name}</MenuItem>
                                        ))
                                    }
                                    {/* Item for each stored set of parameters */}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StoredParametersDropdown));