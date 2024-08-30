import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
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

const DatasetListItem = withStyles ({
  listItem: {
    '& > span': {
      fontSize: '0.9em',
    }
  },

}) ((props) => {
  const { classes, name, isSelected} = props;

  if (isSelected) {
    return (
      <Tooltip title={`${name} is already tagged`}>
        <ListItemText primary={name} className={classes.listItem}/>
      </Tooltip>
    );
  }

  return (
    <ListItemText primary={name} className={classes.listItem}/>
  );
});





const tail = (arg) => (Array.isArray (arg) && arg.length > 0) && arg[arg.length - 1];

const findDiscrepancies = (story, tags, datasetNames) => {
  const { headline = "", link = "", content = "", links = [] } = story;
  const words = new Set();


  const add = (item) => typeof item === 'string' && words.add (item.toLowerCase());

  const linkShortName = tail (link.split('/')).toLowerCase();
  add (linkShortName);
  headline.split (' ').forEach (add);
  content.split (' ').forEach (add);
  links.map (({ text, url }) => {
    text.split (' ').forEach (add);
    add (tail (url.split ('/')));
  });

  const missingTags = links
        .map (({ url }) => tail (url.split ('/')))
        .map (lastSegment => lastSegment && lastSegment.toLowerCase && lastSegment.toLowerCase())
        .concat ([linkShortName])
        .filter (ls => !tags.some ((t) => t.toLowerCase() === ls)) // narrow to links that are not tagged
        .filter (ls => datasetNames.find (({ shortName }) => shortName.toLowerCase () === ls)) // narrow to dataset names
        .map (ls => ({ t: ls, missing: true }));

  const isUnmentioned = (shortName) => {
    return !words.has (shortName.toLowerCase())
  }

  const tagList = tags.map ((tag) => {
    const newTag = { t: tag,  };
    if (isUnmentioned (tag)) {
      newTag.unmentioned = true;
    }
    return newTag;
  }).concat (missingTags)

  return tagList;
}

const useTagStyles = makeStyles ((theme) => ({
  tagList: {
    margin: '-5px',
  },
  chip: {
    margin: '5px',
  }
}));


const Tags = (props) => {
  const {
    handleAdd,
    handleDelete,
    tags,
  } = props;
  const cl = useTagStyles ();

  return (
    <div className={cl.tagList}>
      {tags && tags.map((tag, ix) => {
        if (tag.unmentioned) {
          return (
            <React.Fragment key={`tag${ix}`}>
              <Tooltip title={`This short name is tagged, but not mentioned in the news item.`} placement="bottom-end">
                <UnmentionedChip
                  className={cl.chip}
                  label={tag.t}
                  onDelete={handleDelete (tag.t)}
                  color="primary" />
              </Tooltip>
            </React.Fragment>)
        } else if (tag.missing) {
          return (
            <React.Fragment key={`missing${ix}`}>
              <Tooltip title={'This short name is mentioned in the news item, but is not yet tagged. Click to add.'} placement="bottom-end">
                <MissingChip label={`(+) ${tag.t}`} onClick={handleAdd (tag.t)} className={cl.chip} />
              </Tooltip>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={`tag${ix}`}>
              <Tooltip title={`This short name is "tagged": it is associated with this news item.`} placement="bottom-end">
                <Chip
                  className={cl.chip}
                  label={tag.t}
                  onDelete={handleDelete (tag.t)}
                  color="primary" />
              </Tooltip>
            </React.Fragment>)
        }
      })}

    </div>
  );
}


// Main Tag Manager Component
const useStyles = makeStyles ((theme) => ({
  container: {
    fontSize: '0.9em',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  manager: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    boxSizing: 'border-box',
    padding: '1em',
    marginTop: '1em',
    flex: 1, // expand to full height
  },
  selectTitle: {
    color: '#69FFF2',
    textTransform: 'uppercase',
    fontSize: '16px',
    margin: '1em 0 0 0',
  },
  listContainer: {
    flex: 1,
    maxHeight: '500px',
    width: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const Tagger = (props) => {
  const { addDataset, tags, removeDataset, editState } = props;
  const cl = useStyles ();
  const datasets = useSelector (datasetNamesFullList);

  const [datasetNames, setDatasetNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDatasets, setFilteredDatasets] = useState ([]);

  const [tagList, setTagList] = useState([]); // datasets in story but not tagged


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

  // flag missing/unmentioned datasets
  useEffect (() => {
    const newTagList = findDiscrepancies (editState, tags, datasetNames);
    setTagList (newTagList);
  }, [editState, tags, datasetNames]);

  const handleChange = (ev) => {
    setSearchTerm (ev.target.value.toLowerCase());
  }

  const handleAdd = (name) => (/* event */) => {
    addDataset (name);
  }
  const handleDelete = (name) => (/* event */) => {
    removeDataset (name);
  }

  const isTagged = (target) => {
    return Boolean (tags.find (t => t.toLowerCase() === target.toLowerCase ()));
  }

  return (
    <div className={cl.container}>
      <Typography className={cl.subTitle}>Tagged Datasets</Typography>
      <div className={cl.manager}>
        <Tags
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          tags={tagList}
        />

        <Typography className={cl.selectTitle}>Add Dataset Tags</Typography>

        <TextField label="Search" onChange={handleChange}/>
        <div className={cl.listContainer}>
          <List>
            {filteredDatasets && filteredDatasets.map(({ shortName }, ix) => {
              const thisDatasetIsTagged = isTagged (shortName);
              return (
                <ListItem
                  selected={thisDatasetIsTagged}
                  disabled={thisDatasetIsTagged}
                  button
                  onClick={handleAdd (shortName)}
                  key={ix}
                >
                  <DatasetListItem name={shortName} isSelected={thisDatasetIsTagged} />
                </ListItem>
              )
            })}
          </List>
        </div>
      </div>
    </div>
  );
}

export default Tagger;
