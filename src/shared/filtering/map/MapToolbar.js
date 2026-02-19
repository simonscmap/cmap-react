import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import colors from '../../../enums/colors';

const MODE_PAN = 'pan';
const MODE_SELECT = 'select';

const toolbarBackground = '#0f2d42';

const useStyles = makeStyles((theme) => ({
  toolbarVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    backgroundColor: toolbarBackground,
    borderRadius: 4,
    width: 'fit-content',
    height: 'fit-content',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  toolbarHorizontal: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    backgroundColor: toolbarBackground,
    borderRadius: 4,
    width: 'fit-content',
    height: 'fit-content',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  divider: {
    height: '0.5px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: theme.spacing(0.5, 0),
  },
  dividerHorizontal: {
    width: '0.5px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: theme.spacing(0, 0.5),
  },
  button: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 2,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: colors.greenHover,
    },
  },
  buttonDisabled: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 2,
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  buttonActive: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 2,
    backgroundColor: 'transparent',
    color: colors.primary,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  icon: {
    fontSize: 18,
  },
}));

const MapToolbar = ({
  orientation,
  mode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  zoomOutDisabled,
}) => {
  let classes = useStyles();

  let isVertical = orientation === 'vertical';
  let toolbarClass = isVertical ? classes.toolbarVertical : classes.toolbarHorizontal;
  let dividerClass = isVertical ? classes.divider : classes.dividerHorizontal;

  return (
    <Box className={toolbarClass}>
      <IconButton
        className={classes.button}
        onClick={onZoomIn}
        title="Zoom In"
        size="small"
      >
        <AddIcon className={classes.icon} />
      </IconButton>

      <IconButton
        className={zoomOutDisabled ? classes.buttonDisabled : classes.button}
        onClick={zoomOutDisabled ? undefined : onZoomOut}
        title="Zoom Out"
        size="small"
        disableRipple={zoomOutDisabled}
      >
        <RemoveIcon className={classes.icon} />
      </IconButton>

      <Box className={dividerClass} />

      <IconButton
        className={mode === MODE_PAN ? classes.buttonActive : classes.button}
        onClick={() => onModeChange(MODE_PAN)}
        title="Pan"
        size="small"
      >
        <OpenWithIcon className={classes.icon} />
      </IconButton>

      <IconButton
        className={mode === MODE_SELECT ? classes.buttonActive : classes.button}
        onClick={() => onModeChange(MODE_SELECT)}
        title="Draw Rectangle"
        size="small"
      >
        <CheckBoxOutlineBlankIcon className={classes.icon} />
      </IconButton>
    </Box>
  );
};

MapToolbar.propTypes = {
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  mode: PropTypes.oneOf([MODE_PAN, MODE_SELECT]).isRequired,
  onModeChange: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  zoomOutDisabled: PropTypes.bool,
};

MapToolbar.defaultProps = {
  orientation: 'vertical',
  zoomOutDisabled: false,
};

export { MODE_PAN, MODE_SELECT };
export default MapToolbar;
