import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import HideAtBreakPoint from './Display/HideAtBreakPoint';
import SpatialCoverage from './Display/SpatialCoverage';
import TemporalCoverage from './Display/TemporalCoverage';
import RegionsTable from './Display/RegionsTable';
import SensorsTable from './Display/SensorsTable';
import TableRowTextPair from './Display/TableRowPair';
import PopperCopy from './Display/PopperCopy';
import Ack from './Display/Ack';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    // arrange the 3 metadata columns
    height: '235px',
    width: '100%',
    display: 'inline-grid',
    gridTemplateColumns: '3fr 1fr 1fr',
    columnGap: '2em',

    '@media (max-width: 2400px)': {
      // sensors and regions column is hidden
      gridTemplateColumns: '2fr 1fr',
    },
    '@media (max-width: 1960px)': {
      // spatial and temporal extent column is hidden
      gridTemplateColumns: 'unset',
      gridAutoFlow: 'column',
    },
    '@media (max-width: 1570px)': {
      // graphic is hidden
      gridTemplateColumns: 'unset',
      gridAutoFlow: 'column',
    },
  },
  group: {
    height: '100%',
    '& table': {
      tableLayout: 'fixed',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  special: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '235px',
    '& > div': {
      // padding: '1em 1em 0 1em',
    },
  },
  ack: {
    width: '100%',
    display: 'grid', // use grid, not flex, so that label div doesn't collapse below desired width
    gridTemplateColumns: '200px 1fr',
    paddingTop: '1em',
  },
  ackLabel: {
    width: '200px',
    paddingRight: '.3em',
    textAlign: 'left',
    '& p.MuiTypography-root': {
      color: 'rgb(135, 255, 244)',
      whiteSpace: 'nowrap',
      fontSize: '.9em',
    },
  },
  ackTextContainer: {
    textAlign: 'left',
    '& p.MuiTypography-root': {
      fontSize: '.9em',
    },
  },
}));

const Meta = (props) => {
  const cl = useStyles();
  const { dataset } = props;
  const {
    Acknowledgement,
    Data_Source,
    Depth_Max,
    Distributor,
    Regions,
    Sensors,
    Spatial_Resolution,
    Table_Name,
    Temporal_Resolution,
  } = dataset;

  const depthLevels = Depth_Max
    ? 'Multiple Depth Levels'
    : 'Surface Level Data';

  return (
    <React.Fragment>
      <div className={cl.gridContainer}>
        <div className={cl.group}>
          <TableContainer size="small">
            <Table>
              <TableBody>
                <TableRowTextPair
                  label={'Table Name'}
                  value={Table_Name}
                  mono={true}
                  customComponent={PopperCopy}
                />
                <TableRowTextPair
                  label={'Temporal Resolution'}
                  value={Temporal_Resolution}
                />
                <TableRowTextPair
                  label={'Spatial Resolution'}
                  value={Spatial_Resolution}
                />
                <TableRowTextPair label={'Depth'} value={depthLevels} />
                <TableRowTextPair label={'Source'} value={Data_Source} />
                <TableRowTextPair label={'Distributor'} value={Distributor} />
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <HideAtBreakPoint lt={1960}>
          <div className={cl.group}>
            <div className={cl.special}>
              <SpatialCoverage dataset={dataset} />
              <TemporalCoverage dataset={dataset} />
            </div>
          </div>
        </HideAtBreakPoint>

        <HideAtBreakPoint lt={2400}>
          <div className={cl.group}>
            <SensorsTable sensors={Sensors} />
            <RegionsTable regions={Regions} />
          </div>
        </HideAtBreakPoint>
      </div>

      <div className={cl.ack}>
        <div className={cl.ackLabel}>
          <Typography>Acknowledgment</Typography>
        </div>
        <div className={cl.ackTextContainer}>
          <Ack text={Acknowledgement} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Meta;
