import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core';
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

import { datasetVariableSelect } from '../../../Redux/actions/catalog';
import { safePath } from '../../../Utility/objectUtils';

const useRowStyles = makeStyles({
  root: {
    cursor: 'pointer',
    '& td': {
      maxWidth: '160px',
      lineClamp: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& > *': {
      borderBottom: 'unset',
    },
    '&:hover': {
      backgroundColor: 'rgba(30, 67, 113, .5)',
    },
    '&.selected': {
      backgroundColor: 'rgba(30, 67, 113, .5)',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  header: {
    height: '100%',
    minHeight: '500px',
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
    height: '100%',
    // zIndex: zIndex.LOADING_OVERLAY + 2,
  },
  root: {
    // table header
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
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
    height: 'calc(100% - 65px)',
    maxHeight: '500px',
    // zIndex: zIndex.LOADING_OVERLAY + 2,
  },
  selectedLabel: {},
  selectedShortName: {
    color: theme.palette.primary.main,
  },
  iconWrapper: {
    textAlign: 'center',
    height: '100%',
    maxHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    '& img': {
      objectFit: 'contain',
      maxHeight: '200px',
    },
  },
}));

const SectionHeader = (props) => {
  const cl = useStyles();
  const { title } = props;
  console.log('title', title);
  return (
    <Typography variant="h5" className={cl.sectionHeader}>
      {title}
    </Typography>
  );
};

const DatasetIcon = (props) => {
  const { url, message = '' } = props;
  const cl = useStyles();
  return (
    <div className={cl.header}>
      <SectionHeader title={'Visualization'} />
      <div className={cl.iconWrapper}>
        <img src={url} />
        <p>{message}</p>
      </div>
    </div>
  );
};

const Row = (props) => {
  const { selectedValue, selectVariable, variable } = props;
  const { Long_Name, Short_Name, Sensor, Unit } = variable;
  const classes = useRowStyles();
  const isSelected = selectedValue === Short_Name;
  const selectedClass = isSelected ? 'selected' : '';

  const handleChange = (ev) => {
    const eValue = ev.target.value;
    selectVariable(eValue);
  };

  return (
    <React.Fragment>
      <TableRow
        className={`${classes.root} ${selectedClass}`}
        onClick={() => selectVariable(Short_Name)}
      >
        <TableCell padding="checkbox">
          <Radio
            checked={selectedValue && selectedValue === Short_Name}
            onChange={handleChange}
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
};

const SelectDatasetVariableForSampleVisualization = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const datasetData = useSelector(
    (state) => state.datasetDetailsPage.data || {},
  );

  const visVars = useSelector(
    safePath(['datasetDetailsPage', 'visualizableVariables', 'variables']),
  );

  const visVarData = useSelector(
    safePath(['datasetDetailsPage', 'visualizableDataByName']),
  );

  const selectedVisVar = useSelector(
    (state) => state.datasetDetailsPage.visualizationSelection,
  );

  const selectedVarHasData = safePath([selectedVisVar, 'data'])(visVarData);

  let [visible, setVisible] = useState(false);

  const selectVariable = (shortName) => {
    if (shortName !== selectedVisVar) {
      dispatch(datasetVariableSelect(shortName));
    }
  };

  useEffect(() => {
    if (!visible && selectedVarHasData) {
      setVisible(true);
    }
  }, [visVarData]);

  // Display: Loading Variables | Variables Unavailable
  if (!visVars || !visible) {
    return <DatasetIcon url={datasetData && datasetData.Icon_URL} />;
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
      <SectionHeader title={'Visualization'} />
      <div className={cl.inner}>
        <Grow in={visible}>
          <TableContainer component={Paper} className={cl.container}>
            <Table
              aria-label="collapsible table"
              stickyHeader
              className={cl.root}
            >
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
                  <Row
                    key={v.ID}
                    variable={v}
                    selectVariable={selectVariable}
                    selectedValue={selectedVisVar}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grow>
      </div>
    </div>
  );
};

export default SelectDatasetVariableForSampleVisualization;
