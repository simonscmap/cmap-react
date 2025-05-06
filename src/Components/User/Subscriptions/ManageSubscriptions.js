import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'row',
  },
  datasetIcon: {
    width: '200px',
    objectFit: 'cover',
  },
});

function Row(props) {
  const { row = {}, updateSub } = props;
  const cl = useRowStyles();

  const handleChange = (ev) => {
    console.log('handle change', ev.target.name, ev.target.value);
    const name = ev.target.name;
    const value = ev.target.value;
    updateSub(name, value);
  };

  return (
    <React.Fragment>
      <TableRow className={cl.root}>
        <TableCell>
          <Switch
            checked={row.active}
            onChange={handleChange}
            name={row.shortName}
          />
        </TableCell>
        <TableCell>{row.shortName}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const useTableStyles = makeStyles({
  table: {},
  colHead: {
    fontWeight: 'bold',
  },
});

const SubTable = (props) => {
  const { data = [], handleSave } = props;
  const cl = useTableStyles();

  const state = data.map((s) => ({ shortName: s.shortName, active: true }));

  const [subState, setSubState] = useState(state);

  const updateSub = (name, value) => {
    console.log('update', name);
    setSubState(
      subState.map((s) => {
        if (s.shortName === name) {
          return {
            shortName: s.shortName,
            active: value,
          };
        } else {
          return s;
        }
      }),
    );
  };

  return (
    <TableContainer>
      <Table size="small" className={cl.table} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell>Subscribe</TableCell>
            <TableCell className={cl.colHead}>Dataset Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subState.map((g, i) => (
            <Row key={`${i}`} row={g} updateSub={updateSub} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiPaper-root': {
      background: 'linear-gradient(103.17deg, #213d5e 18.14%, #07274D 79.18%)',
    },
  },
}));

export default function ResponsiveDialog(props) {
  const { open, setOpen, subs } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const cl = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = (data) => {
    console.log('handle save', data);
  };

  return (
    <div>
      <Dialog
        classes={{
          root: cl.root,
        }}
        fullScreen={fullScreen}
        maxWidth={'lg'}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle>{'Manage Subscriptions'}</DialogTitle>
        <DialogContent>
          <SubTable data={subs} handleSave={handleSave} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
