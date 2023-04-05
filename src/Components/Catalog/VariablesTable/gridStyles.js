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
