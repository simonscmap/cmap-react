import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

export const NavButton = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.main ,
      color: 'black',
    },
    '&.MuiButton-root.Mui-disabled': {
      borderColor: 'rgba(255, 253, 253, 0.13)',
      color: 'rgba(255, 253, 253, 0.13)',
    },
    borderRadius: '6px',
    boxSizing: 'border-box',
    padding: '23px',
    height: '46px',
    fontSize: '1.2em',
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    minWidth: '175px'
  },
}))(Button);

export default NavButton;
