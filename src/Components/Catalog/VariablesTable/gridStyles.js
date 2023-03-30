import colors from '../../../enums/colors';

export const cellStyles = () => ({
  dialogPaper: {
    backgroundColor: colors.solidPaper,
    color: 'white',
    padding: '12px',
  },

  markdown: {
    '& img': {
      maxWidth: '100%',
      margin: '20px auto 20px auto',
      display: 'block',
    },
    '& a': {
      color: colors.primary,
      textDecoration: 'none',
    },
  },
});

export const gridStyles = () => ({
  gridWrapper: {
    border: '1px solid black',
  },

  helpButton: {
    margin: '0 0 -40px 6px',
  },

});

export const toolPanelStyles = () => ({});
