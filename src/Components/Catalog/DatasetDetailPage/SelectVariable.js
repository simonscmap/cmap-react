import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  MenuItem,
  makeStyles,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';


import {
  datasetVariableSelect
} from '../../../Redux/actions/catalog';
import { safePath } from '../../../Utility/objectUtils';
import zIndex from '../../../enums/zIndex';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

const useStyles = makeStyles ((theme) => ({
  header: {
  },
  wrapper: {
    marginTop: '10px',
    marginRight: '10px',
    marginBottom: '12px',
    display: 'flex',
    gap: '1em',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inner: {
    // position: 'absolute',
    // top: '60px',
    width: '100%',
    // zIndex: zIndex.LOADING_OVERLAY + 2,
  },
  root: {
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    }
  },
  sectionHeader: {
    color: 'white',
    margin: '16px 0 16px 0',
    fontWeight: 100,
    fontFamily: '"roboto", Serif',
  },
  container: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    maxHeight: '500px',
    zIndex: zIndex.LOADING_OVERLAY + 2,
  },
  selectedLabel: {

  },
  selectedShortName: {
    color: theme.palette.primary.main
  }
}));

const SectionHeader = (props) => {
  const cl = useStyles ()
  const { title } = props;
  return (
    <Typography variant="h5" className={cl.sectionHeader}>
      {title}
    </Typography>
  );
}

const Row = (props) => {
  const { selectedValue, handleSelect, variable } = props;
  const { Long_Name, Short_Name, Sensor, Unit } = variable;
  const classes = useRowStyles();
  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell padding="checkbox">
          <Radio
            checked={selectedValue && selectedValue === Short_Name}
            onChange={handleSelect}
            value={Short_Name}
            name="radio-button"
            inputProps={{ 'aria-label': variable.Long_Name }}
          />
        </TableCell>
        <TableCell>{Long_Name}</TableCell>
        <TableCell>{Short_Name}</TableCell>
        <TableCell>{Sensor}</TableCell>
        <TableCell>{Unit}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const SelectDatasetVariableForSampleVisualization = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();
  const visVars = useSelector (
    safePath ([
      'datasetDetailsPage',
      'visualizableVariables',
      'variables'
  ]));

  const selectedVisVar = useSelector ((state) =>
    state.datasetDetailsPage.visualizationSelection);

  let [visible, setVisible] = useState(false);

  const handleChange = (ev) => {
    const eValue = ev.target.value;
    if (eValue !== selectedVisVar) {
      dispatch (datasetVariableSelect(eValue));
    }
  };

  useEffect (() => {
    if (!visible && visVars) {
      setVisible(true);
    }
  }, [visVars]);



  // Display: Loading Variables | Variables Unavailable
  if (!visVars) {
    return '';
  }
  /*
   * <div className={cl.wrapper}>
   *         <div className={cl.selectedLabel}>
   *           <span>{'Visualizing '}</span>
   *           <span className={cl.selectedShortName}>{' '}{selectedVisVar}</span>
   *         </div>
   *         <Button onClick={() => setOpen (!open)}>
   *           {'Select Variable'}
   *           {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> }
   *         </Button>
   *       </div>
   *  */
  return (
    <div className={cl.header}>
      <SectionHeader title={'Visualization'}/>
      <div className={cl.inner}>
        <Grow in={visible}>
            <TableContainer component={Paper} className={cl.container} >
              <Table aria-label="collapsible table" stickyHeader className={cl.root}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Name</TableCell>
                    <TableCell>Short Name</TableCell>
                    <TableCell>Sensor</TableCell>
                    <TableCell>Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visVars.map((v) => (
                    <Row key={v.ID} variable={v} handleSelect={handleChange} selectedValue={selectedVisVar} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grow>
        </div>
    </div>
  );
}

export default SelectDatasetVariableForSampleVisualization;
