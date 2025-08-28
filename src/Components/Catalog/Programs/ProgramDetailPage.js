import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Page2 from '../../Common/Page2';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { SectionHeader } from './Proto';
import SampleVisualization from './SampleVisualization/SampleVisualization';
import Globe from './Globe/Globe';
import DatasetList2 from './DatasetList';
import MultiDatasetDownloadContainer from '../../../features/multiDatasetDownload/components/MultiDatasetDownloadContainer';
import { matchProgram } from './programData';
import {
  trajectorySelector,
  cruiseSelector,
  activeTrajectorySelector,
} from './programSelectors';

import {
  fetchProgramDetailsSend,
  setProgramCruiseTrajectoryFocus,
} from '../../../Redux/actions/catalog';

const useStyles = makeStyles(() => ({
  container: {
    color: 'white',
    padding: '50px 25px',
  },
  blurbContainer: {
    height: '500px',
    background: 'rgba(0,0,0, 0.2)',
    borderRadius: '5px',
    padding: '19px 10px 5px 22px',
    textAlign: 'justify',
    boxShadow: `0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)`,
  },
  paragraphs: {
    paddingRight: '10px',
    height: 'calc(100% - 10px)',
    overflow: 'scroll',
    hyphens: 'auto',
    '& img': {
      width: '180px',
      margin: '0',
    },
    '& h6': {
      marginBottom: '2em',
    },
  },
  verticalPlaceholder: {
    height: '700px',
  },
  visVerticalPlaceholder: {
    height: '700px',
    '& > div': {
      // pull the visualization up in line with the top of the table headers
      margin: '-58px 0 0 0',
    },
    '& .js-plotly-plot': {
      borderRadius: '5px',
      overflow: 'hidden',
      boxShadow:
        '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    },
  },
  logoContainer: {
    width: '200px',
    height: '200px',
    margin: '0 20px 20px 0',
    float: 'left',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const getRowCount = (dataset) => {
  const stats = dataset.visualizableVariables?.stats;
  if (!stats) return null;

  return stats.lat?.count ?? stats.lon?.count ?? stats.time?.count ?? null;
};

const transformDatasetMetadata = (datasets) => {
  return Object.values(datasets).map((dataset) => ({
    ...dataset,
    Row_Count: getRowCount(dataset),
    ...(dataset.visualizableVariables?.stats?.lat && {
      Lat_Min: dataset.visualizableVariables.stats.lat.min,
      Lat_Max: dataset.visualizableVariables.stats.lat.max,
    }),
    ...(dataset.visualizableVariables?.stats?.lon && {
      Lon_Min: dataset.visualizableVariables.stats.lon.min,
      Lon_Max: dataset.visualizableVariables.stats.lon.max,
    }),
    ...(dataset.visualizableVariables?.stats?.time && {
      Time_Min: dataset.visualizableVariables.stats.time.min,
      Time_Max: dataset.visualizableVariables.stats.time.max,
    }),
    ...(dataset.visualizableVariables?.stats?.depth && {
      Depth_Min: dataset.visualizableVariables.stats.depth.min,
      Depth_Max: dataset.visualizableVariables.stats.depth.max,
    }),
  }));
};

const ProgramDetail = (props) => {
  const cl = useStyles();
  const routeParam = props.match.params.programName; // param defined in App.js
  const pData = matchProgram(routeParam);

  const dispatch = useDispatch();
  const history = useHistory();

  // Get program details from Redux state for datasets
  const program = useSelector((state) => state.programDetails);

  // Extract Metadata for datasets for MultiDatasetDownloadContainer
  const datasetsMetadata = !program?.datasets
    ? []
    : transformDatasetMetadata(program.datasets);

  useEffect(() => {
    // navigate action
    if (pData) {
      dispatch(fetchProgramDetailsSend(pData.title));
    }
    return () => {
      // unload action
    };
  }, []);

  if (!pData) {
    history.push('/catalog/programs');
    return '';
  }

  const onCruiseFocus = (cruiseId) => {
    dispatch(setProgramCruiseTrajectoryFocus({ cruiseId }));
  };

  const copy = pData.detail || [pData.blurb];

  return (
    <Page2 bgVariant={'slate2'}>
      <Grid container spacing={3} className={cl.container}>
        <Grid item xs={5}>
          <div className={cl.blurbContainer}>
            <div className={cl.paragraphs}>
              <div className={cl.logoContainer}>
                {pData.logo && <img src={`/images/${pData.logo}`} />}
              </div>
              {copy.map((c, ix) => (
                <Typography variant="h6" key={`copy_${ix}`}>
                  {c}
                </Typography>
              ))}
            </div>
          </div>
        </Grid>
        <Grid item xs={7}>
          <Globe
            trajectorySelector={trajectorySelector}
            cruiseSelector={cruiseSelector}
            activeTrajectorySelector={activeTrajectorySelector}
            onCruiseFocus={onCruiseFocus}
            downSampleWarning={true}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={5}>
          <div className={cl.verticalPlaceholder}>
            <DatasetList2 />
          </div>
        </Grid>
        {datasetsMetadata.length > 0 && (
          <Grid item xs={12}>
            <MultiDatasetDownloadContainer
              datasetsMetadata={datasetsMetadata}
            />
          </Grid>
        )}
        <Grid item xs={12} md={12} lg={7}>
          <div className={cl.visVerticalPlaceholder}>
            <SectionHeader title={'Sample Visualization'} />
            <SampleVisualization />
          </div>
        </Grid>
      </Grid>
    </Page2>
  );
};

export default ProgramDetail;

export const programDetailConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
