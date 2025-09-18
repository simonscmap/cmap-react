import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import api from '../../api/api';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { snackbarOpen } from '../../Redux/actions/ui';

const useRowStyles = makeStyles({
  root: {
    '& > th': {
      padding: 0,
    },
    '& > td': {
      padding: '0 1em 0 0',
    },
    '& > *': {
      borderBottom: 'unset',
    },
    '& a': {
      color: 'white',
    },
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  expandibleRow: {
    '& > td': {
      paddingLeft: '56px',
      paddingBottom: 0,
      paddingTop: 0,
    },
    '& table': {
      marginBottom: '2em',
    },
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
});

const Row = (props) => {
  const { dataset, handleSelect, selectedRows = [] } = props;
  const { variables, Dataset_Long_Name, Dataset_Name, JSON_stats } = dataset;
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();
  const isSelected = selectedRows.includes(Dataset_Name);

  let datapointsCount;
  try {
    const stats = JSON.parse(JSON_stats);
    datapointsCount = stats.lat.count.toLocaleString();
  } catch (e) {
    console.log('failed to parse JSON_stats', JSON_stats, Dataset_Name);
  }

  return (
    <React.Fragment>
      <TableRow hover className={classes.root}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onClick={() => handleSelect(Dataset_Name)}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          <Link to={'/catalog/datasets/' + Dataset_Name}>
            {Dataset_Long_Name}
          </Link>
        </TableCell>
        <TableCell align="left">{datapointsCount || ''}</TableCell>
        <TableCell align="left" className={classes.noWrap}>
          <span className={classes.link} onClick={() => setOpen(!open)}>
            {variables.length} Variables
          </span>
        </TableCell>
      </TableRow>
      <TableRow className={classes.expandibleRow}>
        <TableCell colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="variables">
                <TableHead>
                  <TableRow>
                    <TableCell>Variable Name</TableCell>
                    <TableCell>Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variables.map((variable) => (
                    <TableRow key={variable.Long_Name}>
                      <TableCell>
                        {variable.Long_Name} ({variable.Short_Name})
                      </TableCell>
                      <TableCell>{variable.Unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const useTableStyles = makeStyles({
  tableHead: {
    '& > th': {
      paddingLeft: 0,
      paddingRight: '1em',
    },
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: '2em',
    marginTop: '2em',
  },
  selectAllControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const DatasetSelectionTable = (props) => {
  const { datasets, cruiseShortName } = props;
  const classes = useTableStyles();
  let [selected, setSelected] = useState([]);
  let [selectAll, setSelectAll] = useState(false);

  const handleSelect = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => name !== n));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(datasets.map((dataset) => dataset.Dataset_Name));
      setSelectAll(true);
    }
  };

  const user = useSelector((s) => s.user);
  const history = useHistory();
  const dispatch = useDispatch();

  const initiateDownload = () => {
    if (selected.length === 0) {
      dispatch(
        snackbarOpen(
          'No datasets selected. Please select datasets to download.',
        ),
      );
    } else if (!user) {
      history.push('/login?redirect=catalog/cruises/' + cruiseShortName);
    } else {
      dispatch(
        snackbarOpen(
          'Your dowload will start momentarily. Please do not close your browser window until it completes.',
        ),
      );
      api.bulkDownload.downloadData(selected);
    }
  };

  return (
    <React.Fragment>
      <div className={classes.toolbar}>
        <div className={classes.selectAllControl}>
          <Checkbox checked={selectAll} onClick={handleSelectAll} />
          <Typography>Select All</Typography>
        </div>
        <Button onClick={initiateDownload} variant="contained" color="primary">
          Download ({selected.length} Datasets)
        </Button>
      </div>
      <TableContainer>
        <Table aria-label="collapsible table" size="dense">
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell>Select</TableCell>
              <TableCell>Dataset Name</TableCell>
              <TableCell>Rows</TableCell>
              <TableCell className={classes.noWrap}>
                Variables (Click to Expand)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((dataset) => (
              <Row
                key={dataset.Dataset_ID}
                dataset={dataset}
                handleSelect={handleSelect}
                selectedRows={selected}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

export default DatasetSelectionTable;
