import Button from '@material-ui/core/Button';
import React, { useEffect } from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import api from '../../api/api';
import { homeTheme, colors } from '../Home/theme';

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    width: '100%',
    margin: 0,
    padding: '0 0 100px 0',
    background: colors.gradient.slate2,
  },
  alignmentWrapper: {
    margin: '0 auto',
    maxWidth: '1900px',
    paddingTop: '200px',
    '@media (max-width: 1920px)': {
      paddingLeft: '20px',
    },
    [theme.breakpoints.down('md')]: {
      paddingTop: '150px',
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: '130px',
    }
  }
}));

const TestComponent = () => {
  const cl = useStyles();
  const user = useSelector((s) => s.user);
  if (!user) {
    return '';
  }

  const datasetShortNames = [
    'TN397_Gradients4_uw_par',
    'TN397_Gradients4_uw_tsg',
    'Gradients4_TN397_Nutrients_UW'
  ];
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={cl.mainWrapper}>
        <h1>Test Component</h1>
        <div>
    <h2>Bulk Download</h2>
    <Button onClick={() => api.bulkDownload.download(datasetShortNames)} >Bulk Download</Button>

        </div>
      </div>
    </ThemeProvider>
  );
}

export default TestComponent;

export const testPageConfig = {
  route: '/test',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
