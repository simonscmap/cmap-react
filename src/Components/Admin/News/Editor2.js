import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { debounce } from 'throttle-debounce';
import { WhiteButtonSM } from '../../Common/Buttons';
import { useDispatch } from 'react-redux';
import { createNewsItem, updateNewsItem } from '../../../Redux/actions/news';
import Card from '../../Home/News/Card';
import LinkEditor, { linkType } from './LinkEditor';
import DatasetTagger from './DatasetTagger';
import EmailManager from './EmailManager';
import Placeholder from './CardPreviewPlaceholder';
import { colors, pxToRem } from '../../Home/theme';
import { safePath } from '../../../Utility/objectUtils';

const useEditorStyles = makeStyles((theme) => ({
  container: {
    margin: '2em 0',
  },
  panelContainer: {
    display: 'grid',
    gridGap: '1em',
    'grid-template-columns': 'repeat(3, [col] calc(33% - 1em))',
    'grid-template-rows': 'repeat(4, [row] auto)',
    margin: '1em 0',
  },

  // ------------ 1
  cardContainer: {
    gridColumn: 'col / span 1',
    gridRow: 'row / span 1',

    display: 'flex',
    flexDirection: 'column',
    alignContent: 'start',
  },
  cardBackdrop: {
    margin: '1em 0',
    position: 'relative',
  },
  // ------------ 2
  editorContainer: {
    gridColumn: 'col 2 / span 2',
    gridRow: 'row / span 3',

    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  editor: {
    marginTop: '1em',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 2,
    padding: '10px',
    overflow: 'hidden',
    position: 'relative',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
  },
  dirty: {
    boxShadow: '0 0 20px rgba(105, 255, 242, 0.6), inset 0 0 10px rgba(105, 255, 242, 0.4), 0 2px 0 #000'

  },
  // --------------- 3
  tagManagerContainer: {
    gridColumn: 'col / span 1',
    gridRow: 'row 2 / span 3',
  },
  // --------------- 4
  emailContainer: {
    gridColumn: 'col 2 / span 2',
    gridRow: 'row 4',
  },

  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5em',
  },
  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.2)',
    '& input': {
      fontSize: `${pxToRem[14]}`,
      border: 0,
      outline: 0,
      '&$hover': {
        border: 0,
        outline: 0,
      },
    },
    '& fieldset': {
      border: 0,
      outline: 0,
    },
  },
}));

const Editor = ({ story: storyState, action, onSubmit, onCancel }) => {
  const classes = useEditorStyles();

  const initialValues = storyState
        ? storyState
        : {
          view_status: 2,
          label: null,
          headline: '',
          link: '',
          date: '',
          body: {
            content: '',
            links: [],
          },
          tags: [],
        };

  const [viewStatus, setViewStatus] = useState(initialValues.view_status);
  const [headline, setHeadline] = useState(initialValues.headline || '');
  const [link, setLink] = useState(initialValues.link || '');
  // let [rank, setRank] = useState(storyState.rank);
  const [date, setDate] = useState(initialValues.date || '');
  const [content, setContent] = useState(
    initialValues.body ? initialValues.body.content : '',
  );
  const [links, setLinks] = useState(
    initialValues.body ? initialValues.body.links : [],
  );
  const [label, setLabel] = useState(initialValues.label || '');

  const [taggedDatasets, setTaggedDatasets] = useState([]);

  const [isDirty, setIsDirty] = useState (false);

  useEffect(() => {
    // update if story state changes in props
    if (storyState) {
      if (storyState.view_status) {
        setViewStatus(storyState.view_status);
      }
      if (storyState.label) {
        setLabel(storyState.label);
      }
      if (storyState.headline) {
        setHeadline(storyState.headline);
      }
      if (storyState.link) {
        setLink(storyState.link);
      }
      if (storyState.date) {
        setDate(storyState.date);
      }
      if (storyState.body) {
        setContent(storyState.body ? storyState.body.content : '');
        setLinks(storyState.body ? storyState.body.links : []);
      }
    }
    if (storyState && Array.isArray(storyState.tags)) {
      setTaggedDatasets (storyState.tags);
    }
  }, [initialValues]);

  useEffect (() => {
    const formDataChanged = true
          && initialValues.headline !== headline
          && initialValues.link !== link
          && initialValues.date !== date
          && initialValues.content !== content
          && initialValues.label !== label
          && initialValues.view_status !== viewStatus;
    const tagsChanged = initialValues.tags.length !== taggedDatasets.length
          || initialValues.tags.every (t => !taggedDatasets.includes (t));

    const initialLinks = safePath (['body', 'links' ]) (initialValues) || [];

    const linksChanged = initialLinks.length + links.length > 0
          && (initialLinks.length !== links.length
              || initialLinks.some (l =>
                !links.find (ln =>
                  l.text === ln.text && l.url === ln.url )));

    setIsDirty (formDataChanged || tagsChanged || linksChanged);
  },[
    viewStatus,
    headline,
    link,
    date,
    content,
    links,
    label,
    taggedDatasets
  ]);

  // DATASET TAGS

  const handleAddTag = (name) => {
    const tags = new Set (taggedDatasets);
    tags.add (name);
    setTaggedDatasets (Array.from (tags));
  }

  const handleRemoveTag = (name) => {
    const tags = new Set (taggedDatasets);
    tags.delete (name);
    setTaggedDatasets (Array.from (tags));
  }

  // BODY CONTENT LINKS

  let updateLinks = (ix) => ({ text, url }) => {
    let newLinks = [...links];
    newLinks[ix] = { text, url };
    setLinks(newLinks);
  };

  // cache the link editors
  let linkEditors = [];

  links.forEach((l, ix) => {
    linkEditors.push({ link: l, ix, onChange: updateLinks(ix) });
  });

  // array of tokens indicating the presence of a link in the body content
  let arrayOfLinkTokens = content.match(/\{\d\}/g) || [];

  if (arrayOfLinkTokens && arrayOfLinkTokens.length === 0 && links.length > 0) {
    setLinks([]);
  }

  if (arrayOfLinkTokens.length > links.length) {
    let missingLinks = arrayOfLinkTokens.length - links.length;
    console.log ('creating new link editor', links, missingLinks);
    for (let i = 0; i < missingLinks; i++) {
      // push a new link into the links array
      // for each fewer link in the links array than in the tokens array
      let newLink = {
        text: 'PLACEHOLDER',
        url: '',
      };
      linkEditors.push({
        link: newLink,
        ix: links.length + i,
        onChange: updateLinks(links.length + i),
      });
    }
  }
  if (arrayOfLinkTokens.length < links.length) {
    let excessLinks = links.length - arrayOfLinkTokens.length;
    console.log ('removing excess link', links, excessLinks);
    linkEditors = linkEditors.slice(0, links.length - excessLinks);
    setLinks (links.slice(0, links.length - excessLinks));
  }
  // PAYLOAD

  let editState = {
    ...initialValues,
    view_status: viewStatus,
    label,
    headline,
    link,
    date,
    body: {
      content,
      links,
    },
    tags: taggedDatasets,
  };

  // DISPATCH

  let dispatch = useDispatch();

  let save = () => {
    let story = {
      ...editState,
      modify_date: new Date().toISOString(),
      body: JSON.stringify(editState.body),
    };
    if (action === 'update') {
      dispatch(updateNewsItem(story));
    }
    if (action === 'create') {
      dispatch(createNewsItem(story));
      reset();
      // TODO reset form
    }
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
  };

  // return form to original record
  let reset = () => {
    if (storyState) {
      if (storyState.view_status) {
        setViewStatus(storyState.view_status);
      }
      if (storyState.label) {
        setLabel(storyState.label);
      }
      if (storyState.headline) {
        setHeadline(storyState.headline);
      }
      if (storyState.link) {
        setLink(storyState.link);
      }
      if (storyState.date) {
        setDate(storyState.date);
      }
      if (storyState.body) {
        setContent(storyState.body ? storyState.body.content : '');
        setLinks(storyState.body ? storyState.body.links : []);
      }
      if (storyState.tags && storyState.tags.length) {
        setTaggedDatasets (storyState.tags);
      }
    } else {
      setViewStatus(2);
      setHeadline('');
      setLink('');
      setDate('');
      setContent('');
      setLinks([]);
      setTaggedDatasets([]);
    }

    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  let lt = linkType(link);

  const updateHeadline = debounce (200, (ev) => {
    setHeadline (ev.target.value);
  });

  return (
    <div className={classes.panelContainer}>

      {/* child 1*/}
      <div className={classes.cardContainer}>
        <Typography>Story Preview</Typography>
        <div className={classes.cardBackdrop}>
          {(headline || link || content || label)
           ? <Card story={editState} position={0} />
           : <Placeholder />}
        </div>
      </div>

      {/* child 2*/}
      <div className={classes.editorContainer}>
        <Typography>Editor</Typography>
        <div className={classes.editor}>
          <TextField
            classes={{
              root: classes.textField,
            }}
            label="Headline"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="headline"
            value={headline}
            variant="outlined"
            onChange={updateHeadline}
            fullWidth
          />
          <TextField
            classes={{
              root: classes.textField,
            }}
            label={`Link (${lt})`}
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="link"
            value={link}
            variant="outlined"
            onChange={(ev) => setLink(ev.target.value)}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            label="Display Date"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="date"
            value={date}
            variant="outlined"
            onChange={(ev) => setDate(ev.target.value)}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            label="label"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="label"
            value={label}
            variant="outlined"
            onChange={(ev) => setLabel(ev.target.value.trim())}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            label="Content"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="content"
            value={content}
            variant="outlined"
            onChange={(ev) => setContent(ev.target.value)}
            fullWidth
            multiline={true}
          />

          {linkEditors.map((props, i) => (
            <LinkEditor {...props} key={i} />
          ))}
          <div
            className={classes.controls}
            style={{ justifyContent: 'flex-end' }}
          >
            <WhiteButtonSM
              onClick={save}
              disabled={!isDirty}
              className={isDirty ? classes.dirty : ''}>
              Save
            </WhiteButtonSM>
            <WhiteButtonSM onClick={reset}>Cancel</WhiteButtonSM>
          </div>
        </div>
      </div>


      {/* child 3*/}
      <DatasetTagger
        tags={taggedDatasets}
        addDataset={handleAddTag}
        removeDataset={handleRemoveTag}
        editState={{ headline, link, content, links }}
      />

      {/* child 4*/}
      <EmailManager
        id={storyState && storyState.id}
        tags={taggedDatasets}
        headline={headline}
      />

    </div>
  );
};

export default Editor;
