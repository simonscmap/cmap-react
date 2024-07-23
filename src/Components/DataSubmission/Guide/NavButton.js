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
    boxSizing: 'border-box',
    padding: '0',
    height: '68px',
    width: '68px',
    borderRadius: '34px',
  },
}))(Button);

export default NavButton;
