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

export const toolPanelStyles = () => ({
  title: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    fontSize: '1em',
    alignContent: 'center',
    '& span': {
      borderBottom: `1px solid ${colors.primary}`
    },
  },
  toolPanelContainer: {
    padding: '0.5em 0.5em',
    width: '100%',
    '& h2': {
      fontSize: '1.1em',
    },
  },
  toolBarClose: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'end',
    alignContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    borderBottom: 'none',
    '&:hover': {
      color: colors.primary,
    },
    '& span': {
      borderBottom: 'none',
      lineHeight: '24px',
    }
  },
  customIcon: {
    color: colors.primary,
  },
  // focused view
  variableFocusLabelContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    padding: '1em 0',
  },
  variableLabel: {
    fontSize: '1.2em',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
  },
  variableLongName: {
    textDecoration: `underline ${colors.primary}`,
    color: 'white',
    fontWeight: 'bold',
    lineHeight: '1.4em',
  },
  closeBox: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    cursor: 'pointer',
    '& span': {
      lineHeight: '24px',
    },
    '&:hover': {
      color: colors.primary,
    }
  },

  // list view
  allCommentsLabel: {
    fontWeight: 'bold',
    margin: '1em .5em .5em 1em',
    textAlign: 'right',
    '& span': {
      fontWeight: 'none',
    }
  },

  allCommentsRow: {
    paddingTop: '1em',
    '& td': {
      borderTop: `1px solid rgba(0, 0, 0, 0.4)`,
      verticalAlign: 'top',
    },
    '& td:nth-of-type(odd)': {
      borderRight: `0.75em solid transparent`,
    },
    '& td:nth-of-type(even)': {
      borderLeft: `0.75em solid transparent`,
    },
    '& td a': {
      cursor: 'pointer',
    },
    '& td a:hover': {
      color: colors.primary,
    },
  },

  vumListContainer: {
    '& table': {
      width: '100%',
    }
  },
  vumListRow: {
    overflow: 'scroll',
    padding: '1em',
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '5px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    marginBottom: '1em',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)'
    },
  },

  keyLabel: {
    padding: '0.5em 0 1em 0',
    '& code': {
      color: colors.primary
    }
  },
  headers: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    gap: '2em',
    '& div': {
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: 'bold',
    },

    '@media (max-width: 480px)': {
      '& div:first-child': {
        width: '100px',
      },
    },
    '@media (max-width: 600px)': {
      '& div:first-child': {
        width: '150px',
      },
    },
    '@media (max-width: 900px)': {
      '& div:first-child': {
        width: '250px',
      },
    },
    '@media (min-width: 900px)': {
      '& div:first-child': {
        width: '300px',
      },
    },
  },
  variableName: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    '& > div': {
      paddingBottom: '1em',
    },
    '& a': {
      color: colors.primary,
      cursor: 'pointer',
    },
    '& a:hover': {
      color: 'white',
    },
  },
  longNameChip: {
    display: 'inline-block',
    border: `1px solid rgba(157, 209, 98, 0.3)`,
    borderRadius: '10px',
    padding: '0.25em 1em',
    color: colors.primary,
  },
  blobContainer: {
   //  marginLeft: '2em',
    marginTop: '2em',
    borderTop: `1px solid rgba(157, 209, 98, 0.3)`,
    borderRight: `1px solid rgba(157, 209, 98, 0.3)`,
  },
  blobKeyContainer: {
    marginTop: '0.25em',
    borderTop: `1px solid rgba(157, 209, 98, 0.3)`,
  },
  valuePair: {
    display: 'flex',
    flexDirection: 'row',
    '@media (max-width: 480px)': {
      flexWrap: 'wrap',
      '& div:first-child': {
        width: '100px',
      },
    },
    '@media (max-width: 600px)': {
      '& div:first-child': {
        width: '150px',
      },
    },
    '@media (max-width: 900px)': {
      '& div:first-child': {
        width: '250px',
      },
    },
    '@media (min-width: 900px)': {
      '& div:first-child': {
        width: '300px',
      },
    },
    '& div:first-child': {
    },
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    paddingTop: '1em',
    gap: '2em',
    '& a': {
      color: colors.primary,
    },
    '&  a:visited': {
      color: colors.primary,
    },
  },


  // displaying variable UM
  vumContainer: {
    '& > div:hover': {
      background: 'rgba(0, 0, 0, 0.3)'
    },
    '& a': {
      color: colors.primary,
    },
    '&  a:visited': {
      color: colors.primary,
    },
  },
  vumBlob: {
    border: '1px solid black',
    margin: '1em 0',
    padding: '1em',
  },
  blobKeyHeading: {
    padding: '1em 0',
    fontSize: '1.1em',
    '& code': {
      fontWeight: 'bold',
      color: colors.primary
    }
  },
  blobValuesContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    padding: '1em',
    borderTop: `1px solid ${colors.primary}`,
  },
  blobKeyV: {

  },
  objKVWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    width: '100%',
    padding: '0.25em 0',
    '& code': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    lineHeight: '1em',

  },
  objKVNodeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  blobDesc: {
   paddingLeft: '1em',
  },
});
