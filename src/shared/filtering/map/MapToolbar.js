import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import PanToolIcon from '@material-ui/icons/PanTool';
import SvgIcon from '@material-ui/core/SvgIcon';
import colors from '../../../enums/colors';
import { MODE_PAN, MODE_SELECT } from './mapConfig';

let HighlightAltIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M17 5h-2V3h2v2zm-2 16h2v-2.59L19.59 21 21 19.59 18.41 17H21v-2h-6v6zm4-12h2V7h-2v2zm0 4h2v-2h-2v2zm-8 8h2v-2h-2v2zM7 5h2V3H7v2zM3 17h2v-2H3v2zm2 4v-2H3c0 1.1.9 2 2 2zM19 3v2h2c0-1.1-.9-2-2-2zm-8 2h2V3h-2v2zM3 9h2V7H3v2zm4 12h2v-2H7v2zm-4-8h2v-2H3v2zm0-8h2V3c-1.1 0-2 .9-2 2z" />
  </SvgIcon>
);

const toolbarBackground = colors.slate;

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
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.7), 0 1px 4px rgba(0, 0, 0, 0.5)',
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
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.7), 0 1px 4px rgba(0, 0, 0, 0.5)',
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
        <PanToolIcon style={{ fontSize: 17 }} />
      </IconButton>

      <IconButton
        className={mode === MODE_SELECT ? classes.buttonActive : classes.button}
        onClick={() => onModeChange(MODE_SELECT)}
        title="Draw Rectangle"
        size="small"
      >
        <HighlightAltIcon style={{ fontSize: 22 }} />
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
