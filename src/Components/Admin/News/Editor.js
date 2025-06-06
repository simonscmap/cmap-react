import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WhiteButtonSM } from '../../Common/Buttons';
import { useDispatch } from 'react-redux';
import { createNewsItem, updateNewsItem } from '../../../Redux/actions/news';
import Card from '../../Home/News/Card';
import LinkEditor, { linkType } from './LinkEditor';
import DatasetTagger from './DatasetTagger';
import EmailManager from './EmailManager';
import Placeholder from './CardPreviewPlaceholder';
import editorStyles from './editorStyles';

const useEditorStyles = makeStyles(editorStyles);

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
      setTaggedDatasets(storyState.tags);
    }
  }, [storyState]);

  // DATASET TAGS

  const handleAddTag = (name) => {
    const tags = new Set(taggedDatasets);
    tags.add(name);
    setTaggedDatasets(Array.from(tags));
  };

  const handleRemoveTag = (name) => {
    const tags = new Set(taggedDatasets);
    tags.delete(name);
    setTaggedDatasets(Array.from(tags));
  };

  // BODY CONTENT LINKS

  let updateLinks =
    (ix) =>
    ({ text, url }) => {
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
    console.log('creating new link editor', links, missingLinks);
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
    console.log('removing excess link', links, excessLinks);
    linkEditors = linkEditors.slice(0, links.length - excessLinks);
    setLinks(links.slice(0, links.length - excessLinks));
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
        setTaggedDatasets(storyState.tags);
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

  return (
    <div className={classes.panelContainer}>
      <div className={classes.editorAndPreview}>
        <div className={classes.cardContainer}>
          <Typography>Story Preview</Typography>
          <div className={classes.cardBackdrop}>
            {headline || link || content || label ? (
              <Card story={editState} position={0} />
            ) : (
              <Placeholder />
            )}
          </div>
        </div>

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
              onChange={(ev) => setHeadline(ev.target.value)}
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
              <WhiteButtonSM onClick={save}>Save</WhiteButtonSM>
              <WhiteButtonSM onClick={reset}>Cancel</WhiteButtonSM>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.tagsAndEmail}>
        <div className={classes.tagManagerContainer}>
          <Typography>Tagged Datasets Manager</Typography>
          <DatasetTagger
            tags={taggedDatasets}
            addDataset={handleAddTag}
            removeDataset={handleRemoveTag}
            editState={{ headline, link, content, links }}
          />
        </div>

        <div className={classes.emailContainer}>
          <Typography>Email Notification Manager</Typography>
          <EmailManager id={storyState && storyState.ID} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
