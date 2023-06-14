// exports MUI style definitions for chart components

import colors from '../../../enums/colors';
import z from '../../../enums/zIndex';

export const spaceTimeChartStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },
  buttonBlock: {
    display: 'block',
  },
  iconButtonWrapper: {
    display: 'inline-block',
  },
});

export const histogramStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },
  buttonBlock: {
    display: 'block',
  },
  iconButtonWrapper: {
    display: 'inline-block',
  },
});

export const sparseMapStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },

  buttonBlock: {
    display: 'block',
  },

  tabs: {
    marginBottom: theme.spacing(2),
  },

  tab: {
    boxShadow: '1px 1px 1px 1px #242424',
    fontSize: '15px',
    textTransform: 'none',
    color: theme.palette.primary.main,
  },
});

export const timeSeriesChartStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },
  buttonBlock: {
    display: 'block',
  },
});

export const depthProfileChartStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },
  buttonBlock: {
    display: 'block',
  },
});

export const sectionMapChartStyles = (theme) => ({
  chartWrapper: {
    position: 'relative',
    display: 'inline-block',
    backgroundColor: colors.backgroundGray,
    boxShadow:
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    margin: '20px',
    color: 'white',
  },
  buttonBlock: {
    display: 'block',
  },
});

// ~~~~ extracted control panel styles

export const chartControlIconButton = (theme) => ({
  iconButton: {
    boxShadow: '0px 1px 1px 1px #242424',
  },
});

export const chartControlTabButton = (theme) => ({
  iconButton: {
    boxShadow: '0px 1px 1px 1px #242424',
    padding: '0 20px 0 20px',
  },
});

export const chartControlPaletteMenu = () => ({
  colorscaleMenu: {
    maxHeight: '400px',
    zIndex: z.CONTROL_PRIMARY,
  },
  grayBackground: {
    backgroundColor: colors.backgroundGray,
  },
});

export const chartControlPanelPopoverStyles = (theme) => ({
  popover: {
    width: '470px',
    height: '120px',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    zIndex: z.CONTROL_PRIMARY,
  },
  grayBackground: {
    backgroundColor: colors.backgroundGray,
  },
  setPopoverZ: {
    zIndex: `${z.CONTROL_PRIMARY} !important`,
  },
});

// main control panel styles
export const chartControlPanelStyles = (theme) => ({
  popover: {
    width: '470px',
    height: '120px',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    zIndex: z.CONTROL_PRIMARY,
  },

  iconButton: {
    // TODO remove when switched over to ControlPanel2
    boxShadow: '0px 1px 1px 1px #242424',
  },

  colorForm: {
    width: '100%',
  },

  lastIcon: {
    borderTopRightRadius: '10%',
    borderBottomRightRadius: '10%',
  },

  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '0 0 1em 0',
    // maxWidth: '700px',
    // textAlign: 'center',
    pointerEvents: 'auto',
  },

  depressed: {
    boxShadow: 'inset 1px 1px 5px #262626',
  },

  colorscaleMenu: {
    maxHeight: '400px',
    zIndex: z.CONTROL_PRIMARY,
  },

  setPopoverZ: {
    zIndex: `${z.CONTROL_PRIMARY} !important`,
  },

  grayBackground: {
    backgroundColor: colors.backgroundGray,
  },

  sparseDataMaxSizeWarningIcon: {
    color: colors.errorYellow,
    position: 'absolute',
    top: '60px',
    left: 'calc(50% - 12px)',
    cursor: 'pointer',
    zIndex: z.CONTROL_PRIMARY - 1,
    pointerEvents: 'auto',
  },
});

export const chartsStyles = (theme) => ({
  chartPaper: {
    backgroundColor: colors.backgroundGray,
    marginBottom: '5h',
    paddingTop: theme.spacing(1),
    boxShadow: '2px 2px 2px 2px #242424',
    margin: '0 0 50px 360px',
  },
});

export const chartTemplate = (theme) => ({
  chartTemplate: {
    padding: '0 10px 0 0',
  },
});

export const chartsCloseChartStyles = {
  closeChartIcon: {
    float: 'right',
    marginTop: '-12px',
    marginRight: '-8px',
  },
};
