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
    padding: '100px 0',
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
  },
  vertical: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2em',
    '& button': {
      maxWidth: '300px',
    }
  }
}));

const TestComponent = () => {
  const cl = useStyles();
  const user = useSelector((s) => s.user);
  if (!user) {
    return '';
  }

  const sampleShortNames = [
    'TN397_Gradients4_uw_par',
    'TN397_Gradients4_uw_tsg',
    'Gradients4_TN397_Nutrients_UW'
  ];

  const hot001 = ['HOT_PP'];

  const kok1606 = [
    'Gradients1_KOK1606_PPPCPN_UW',
    'Gradients1_KOK1606_DiazotrophAbundance',
    'Gradients1_KOK1606_UW_Hyperpro_Surface_PAR',
    'Gradients1_KOK1606_FluorometricChlorophyll',
    'Gradients1_KOK1606_15N13C',
    'Gradients1_siderophore_concentrations',
    'Influx_Stations_Gradients_2016',
    'KOK1606_Gradients1_Surface_O2Ar_NCP',
    'Gradients1_KOK1606_Optics_LISST',
    'Gradients1_KOK1606_PPPCPN',
    'Gradients1_KOK1606_NO3d15N_NO3d18O',
    'KOK1606_Gradients1',
    'all_SeaFlow_cruises_v1_5',
    'Gradients1_KOK1606_14C_NPP',
    'Gradients1_KOK1606_HPLC',
    'Gradients1_KOK1606_Hyperpro_Profiles',
    'Gradients_1_Diss_Trace_Metal_Profile',
    'KOK1606_ParticulateCobalamins',
    'KOK1606_Gradients1_Nutrients',
    'KOK1606_Gradients1_CTD',
    'KOK1606_Gradients1_Gases',
    'KOK1606_Gradients1_Diazotroph',
    'SingleCellGenomes_Chisholm',
    'KOK1606_Gradients1_TargetedMetabolites',
    'Gradients1_3_cobalt',
  ];

  const datasetShortNames = kok1606;
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={cl.mainWrapper}>
        <h1>Test Component</h1>
        <div className={cl.vertical}>
          <h2>Bulk Download</h2>
          <Button onClick={() => api.bulkDownload.post(datasetShortNames)} variant="contained" color="primary">
            Bulk Download Post
          </Button>
          <Button onClick={() => api.bulkDownload.get(datasetShortNames)} variant="contained" color="primary">
            Bulk Download Get
          </Button>
          <Button onClick={() => api.bulkDownload.getWindowOpen(datasetShortNames)} variant="contained" color="primary">
            Bulk Download Get (Window Open)
          </Button>
          <Button onClick={() => api.bulkDownload.postWindowOpen(datasetShortNames)} variant="contained" color="primary">
            Bulk Download Post (Window Open)
          </Button>
          <form action={`http://localhost:8080/api/data/bulk-download`} method="post" target="_blank">
            <input type="hidden" name="shortNames" value={JSON.stringify(datasetShortNames)} />
            <button>Post Form Target Blank</button>
          </form>
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
