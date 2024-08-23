import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Link } from 'react-router-dom';

const useExStyles = makeStyles ((theme) => ({
  link: {
    color: theme.palette.primary.main,
    '&:visited': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      color: theme.palette.secondary.main,
    },
    display: 'inline-block',
    padding: '3px 5px'
  }
}));
const Examples = (props) => {
  const { links } = props;
  const cl = useExStyles ();
  if (!links || links.length === 0) {
    return '';
  }
  const linkArray = links
        .split (',')
        .map ((l) => l.trim ())
        .map ((l) => {
          const segments = l.split ('/');
          return {
            link: l,
            name: segments.pop(),
          }
        });
  return (
    <React.Fragment>
      {linkArray.map (({ link, name}, idx) =>
        <Link to={`/catalog/datasets/${name}`} key={`link_${idx}`} className={cl.link}>{name}</Link>)}
    </React.Fragment>
  );
};


// Component: Group

const useGroupStyles = makeStyles ((theme) => ({
  groupLabel: {
    color: '#69FFF2',
    background: 'rgba(0,0,0,0.1)',
    paddingTop: '10px',
    paddingBottom: '10px',
    textTransform: 'uppercase',
  },
  sensor: {
    fontWeight: 'bold',
  }
}));

const Group = (props) => {
  const { data } = props;
  const cl = useGroupStyles ();

  if (!data || !data.members) {
    return '';
  }

  // group :: { label, rank, details, Sensor, Description }
  const first = data.members[0];
  const groupLabel = first && first.category;

  return (
    <React.Fragment>
      <TableRow>
        <TableCell colSpan={3} className={cl.groupLabel}>{groupLabel}</TableCell>
      </TableRow>

      {data.members.map ((member, idx) => (
        <TableRow key={`row_${idx}`}>
          <TableCell className={cl.sensor}>{member.Sensor}</TableCell>
          <TableCell>{member.Description}</TableCell>
          <TableCell><Examples links={member.exData} /></TableCell>
        </TableRow>
      ))}
    </React.Fragment>
  );
}

const useTableStyles = makeStyles (() => ({
  table: {
    '& .MuiTableCell-root': {
      border: 0,
    }
  },
  colHead: {
    fontWeight: 'bold',
    paddingTop: '15px',
    paddingBottom: '15px',
    textTransform: 'uppercase',
  }
}));
const SensorTable = (props) => {
  const { list } = props;
  const cl = useTableStyles();

  return (
    <TableContainer>
      <Table size="small" className={cl.table} aria-label="spanning table">
        <TableHead>
          <TableRow>
            <TableCell className={cl.colHead}>Name</TableCell>
            <TableCell className={cl.colHead}>Description</TableCell>
            <TableCell className={cl.colHead}>Example Datasets</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list && list.map((g, i) => (<Group key={`${i}`} data={g}/>))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
          <div>{children}</div>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: 'none',
  },
  tabBar: {
    background: 'rgba(0,0,0,0.2)',
    '& .MuiTab-wrapper': {
      color: 'white',
    }
  }
}));

const SensorTabs = (props) => {
  const classes = useStyles();

  const { data } = props;

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.tabBar}>
        <Tabs value={value} onChange={handleChange} aria-label="sensor groups">
          <Tab label="Devices" />
          <Tab label="Methods" />
          <Tab label="Uncategorized" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <SensorTable list={data && data.devices} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SensorTable list={data && data.methods} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SensorTable list={data && data.uncat} />
      </TabPanel>
    </div>
  );
}

export default SensorTabs;
