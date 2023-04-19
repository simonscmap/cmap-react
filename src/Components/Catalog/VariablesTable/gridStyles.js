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
    fontSize: '1em',
    '& span': {
      borderBottom: `1px solid ${colors.primary}`
    }
  },
  toolPanelContainer: {
    padding: '0.5em 0.5em',
    width: '100%',
    '& h2': {
      fontSize: '1.1em',
    },
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
    cursor: 'pointer',
  },

  // list view
  allCommentsLabel: {
    // should have same feel as variableLongName
    textDecoration: `underline ${colors.primary}`,
    fontSize: '1.2em',
    fontWeight: 'bold',
    margin: '1em 0',
  },
  allCommentsRow: {
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
