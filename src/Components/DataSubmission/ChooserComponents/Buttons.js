import { withStyles } from '@material-ui/core/styles';
import { Button, Input } from '@material-ui/core';

export const StepButton = withStyles((theme) => ({
  root: {
    color: '#000000',
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'white',
    },
    borderRadius: '6px',
    boxSizing: 'border-box',
    padding: '23px',
    height: '46px',
    fontSize: '1.2em',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    minWidth: '175px',
  },
}))(Button);

export const FileInput = withStyles((theme) => ({
  root: {
    color: '#000000',
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'white',
    },
    borderRadius: '6px',
    boxSizing: 'border-box',
    padding: '23px',
    height: '46px',
    fontSize: '1.2em',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
  },
}))(Input);
