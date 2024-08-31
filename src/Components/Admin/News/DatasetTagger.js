import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import { datasetNamesFullList } from './newsSelectors';


const MissingChip = withStyles ({
  root: {
    background: 'rgb(209, 98, 101)',
    '&:hover': {
      background: 'rgb(209, 98, 101)'
    }
  },
}) (Chip);

const UnmentionedChip = withStyles ({
  root: {
    background: '#d3d3d3'
  },
}) (Chip);




const useStyles = makeStyles ((theme) => ({
  container: {
    fontSize: '0.9em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'start',
    gap: '2em',
  },
  tagList: {
    minWidth: '200px',
    height: '600px',
    overflow: 'scroll',
    flex: 0,
  },
  tagSelect: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    padding: '1em',
    boxSizing: 'border-box',
    width: '500px',
  },
  selectTitle: {
    color: '#69FFF2',
    textTransform: 'uppercase',
    fontSize: '1.1em',
  },
  listContainer: {
    width: '100%',
    height: '400px',
    overflowY: 'scroll',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  listItem: {
    '& > span': {
      fontSize: '0.9em',
    }
  },
  chip: {
    margin: '5px',
  }
}));


const tail = (arg) => Array.isArray (arg) && arg.length > 0 && arg[arg.length - 1];

const findDiscrepancies = (story, tags, datasetNames) => {
  const { headline = "", link = "", content = "", links = [] } = story;
  const words = new Set();
  const add = (item) => typeof item === 'string' && words.add (item.toLowerCase());
  headline.split (' ').forEach (add);
  content.split (' ').forEach (add);
  links.map (({ text, url }) => {
    text.split (' ').forEach (add);
    add (tail (url.split ('/')));
  });

  // find unmentioned
  const unmentioned = tags
        .map (t => datasetNames.find (record => record.shortName === t))
        .filter (({ shortName, longName }) => {
          return !words.has (shortName.toLowerCase())
        })
        .map (n => n.shortName);

  // find missing tags
  const missing = links
        .map (({ url }) => tail (url.split ('/')))
        .filter ((lastSegment) => {
          console.log ('last segment', lastSegment)
          const ls = typeof lastSegment === 'string' && lastSegment.toLowerCase();
          return !tags.some ((t) => t.toLowerCase() === ls);
        });

  return [missing, unmentioned];
}




const Tagger = (props) => {
  const { addDataset, tags, removeDataset, editState } = props;
  const cl = useStyles ();
  const datasets = useSelector (datasetNamesFullList);

  const [datasetNames, setDatasetNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDatasets, setFilteredDatasets] = useState ([]);

  const [missing, setMissing] = useState([]); // datasets in story but not tagged
  const [unmentioned, setUnmentioned] = useState([]) // tagged datasets not mentioned in the story

  // initialize dataset names when they load
  useEffect (() => {
    if (datasets.length) {
      setDatasetNames (datasets)
    }
  }, [datasets]);

  // search
  useEffect (() => {
    if (searchTerm === "") {
      setFilteredDatasets (datasetNames);
    } else {
      const matches = datasetNames
            .filter (({ shortName }) => shortName.toLowerCase().includes (searchTerm));
      setFilteredDatasets (matches);
    }
  }, [searchTerm, datasetNames]);

  // missing/unmentioned datasets
  useEffect (() => {
    const [ missingTags, unmentionedDatasets ] = findDiscrepancies (editState, tags, datasetNames);
    setMissing (missingTags);
    setUnmentioned (unmentionedDatasets);
  }, [editState, tags]);

  const handleChange = (ev) => {
    setSearchTerm (ev.target.value.toLowerCase());
  }

  const handleAdd = (name) => (ev) => {
    addDataset (name)
  }
  const handleDelete = (name) => (ev) => {
    removeDataset (name)
  }

  return (
    <div className={cl.container}>
      <div className={cl.tagList}>
        {tags && tags.map((t, ix) => {
          if (unmentioned.includes (t)) {
            return (<UnmentionedChip
                     className={cl.chip}
                     label={t}
                     onDelete={handleDelete (t)}
                     color="primary" />)
          } else {
            return (<Chip
                     className={cl.chip}
                     label={t}
                     onDelete={handleDelete (t)}
                      color="primary" />)

          }
        })}
        {missing && missing.map ((n, ix) => (
          <MissingChip label={`(+) ${n}`} onClick={handleAdd (n)} className={cl.chip} />
        ))}
      </div>
      <div className={cl.tagSelect}>
        <Typography className={cl.selectTitle}>Tag Datasets</Typography>
        <TextField label="Search" onChange={handleChange}/>
        <div className={cl.listContainer}>
          <List>
            {filteredDatasets && filteredDatasets.map(({ shortName }, ix) => (
              <ListItem
                button
                onClick={handleAdd (shortName)}
                key={ix}
              >
                <ListItemText primary={shortName} className={cl.listItem}/>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export default Tagger;
