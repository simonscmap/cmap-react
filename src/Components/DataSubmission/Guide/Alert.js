import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';

// export an Alert component with CMAP colors

const styles = (theme) => ({
  root: {
    width: 'calc(100% - 100px)',
    margin: '1em auto',
    '& .MuiAlert-icon': {
      fontSize: '30px',
      alignItems: 'center', // vertically center icons
      marginRight: '20px',
    },
    backgroundColor: 'rgba(0,0,0, 0.2)',
    fontWeight: 'bold',
    fontSize: '1em',

    '& .MuiTypography-body1': {
      // fontSize: '1em',
    },

    '&.MuiAlert-outlinedSuccess': {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      '& .MuiAlert-icon': {
        color: theme.palette.primary.main,
      },
      '& .MuiAlert-message': {
        color: theme.palette.primary.main,
      },
    },
    '&.MuiAlert-outlinedWarning': {
      color: 'rgb(209, 98, 101)',
      border: `1px solid rgb(209, 98, 101)`,
    },
    '&.MuiAlert-standardInfo': {
      color: 'rgb(34, 163, 185)',
      border: `1px solid rgb(34, 163, 185)`,
      '& .MuiAlert-icon': {
        color: 'rgb(34, 163, 185)',
      },
    },
  },
});

export const CustomAlert = withStyles(styles)(Alert);
