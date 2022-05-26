import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { pxToRem, colors } from '../Home/theme';

// NOTE: because of the reliance of specificity, you cannot declare pseudo class overrides here
// (such as '&$disabled'); they have to be either in the theme, on declared via 'classes' prop at render

const GreenButton = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
    },
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '23px',
    height: '46px',
    fontSize: pxToRem[18],
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    '@media (max-width: 900px)': {
      fontSize: pxToRem[16],
    },
    '@media (max-width: 600px)': {
      fontSize: pxToRem[14],
    },
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
}))(Button);

const GreenButtonSM = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
    },
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '18px',
    height: '36px',
    fontSize: pxToRem[14],
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
}))(Button);

const WhiteButtonSM = withStyles(() => ({
  root: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
    border: `2px solid #ffffff`,
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '18px',
    height: '36px',
    fontSize: pxToRem[14],
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    whiteSpace: '',
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
}))(Button);

// this isn't teal...
const TealButtonSM = withStyles(() => ({
  root: {
    color: '#ffffff',
    backgroundColor: colors.blue.dark,
    '&:hover': {
      backgroundColor: colors.blue.dark,
      color: '#000000',
    },
    border: `2px solid ${colors.blue.dark}`,
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '18px',
    height: '36px',
    fontSize: pxToRem[14],
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    whiteSpace: '',
    '& span': {
      whiteSpace: 'nowrap',
    },
  },
}))(Button);

export { GreenButton, WhiteButtonSM, GreenButtonSM, TealButtonSM };
