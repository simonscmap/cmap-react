import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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
  }
});

function Row(props) {
  const { row, setSelected } = props;
  const cl = useRowStyles();

  const handleChange = (ev) => {
    const name = ev.target.name;
    setSelected (name, ev.target.checked);
  }

  return (
    <React.Fragment>
      <TableRow className={cl.root}>
        <TableCell><Checkbox onChange={handleChange} name={row.Dataset_Name} /></TableCell>
        <TableCell>{row.Dataset_Name}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}



const useTableStyles = makeStyles({
  table: {
  },
  colHead: {
    fontWeight: 'bold',
  }
});

const Selection = (props) => {
  const { data, setSelected } = props;
  const cl = useTableStyles ();

  return (
    <TableContainer>
      <Table size="small" className={cl.table} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell className={cl.colHead}>Dataset Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((g, i) => (<Row key={`${i}`} row={g} setSelected={setSelected}/>))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


const useListStyles = makeStyles({

});
const ListSelection = (props) => {
  const { data, selected, setSelected } = props;

  const handleClick = (shortName) => (ev) => {
    setSelected(shortName);
  }

  return (
    <div>
      <Typography variant="h6">Select Subscribed Dataset</Typography>
      <List>
        <ListItem
          selected={selected === undefined}
          button
          onClick={handleClick ()}>
          <ListItemText primary={"All Subscriptions"}/>
        </ListItem>

        {data && data.map((item, ix) => (
          <ListItem
            selected={selected === item.Dataset_Name}
            button
            onClick={handleClick (item.Dataset_Name)}
            key={ix}>
            <ListItemText primary={item.Dataset_Name}/>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default ListSelection
