import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { debounce } from 'throttle-debounce';
import { WhiteButtonSM } from '../../Common/Buttons';
import { useDispatch } from 'react-redux';
import { createNewsItem, updateNewsItem } from '../../../Redux/actions/news';
import Card from '../../Home/News/Card';
import LinkEditor, { linkType } from './LinkEditor';
import DatasetTagger from './DatasetTagger';
import EmailManager from './EmailManager';
import Placeholder from './CardPreviewPlaceholder';
import { safePath } from '../../../Utility/objectUtils';
import useEditorStyles from './editorStyles2';

const required = (defaultText) => (value) => {
  const hasError = !value;
  return [hasError, hasError ? 'Required' : defaultText ];
};

const notRequired = (defaultText) => () => [false, defaultText];

const validations = {
  headline: required ('The headline is used in both the News card and as the subject for emails'),
  link: required ('The URL that the headline will link to in the News card'),
  label: notRequired ('Not Required: if provided will populate a bright label to call attention to the news item'),
  date: required ('The display date that will appear on the News card'),
  content: required ('The main text content of the news item'),
}

const validate = (name) => (value) => {
  const fn = validations[name];
  if (fn) {
    return fn (value);
  }
  return [undefined, undefined];
}

const hasError = (name) => (value) => {
  const [error] = validate (name) (value);
  return error;
}

const getHelpText = (name) => (value) => {
  const [, reason] = validate (name) (value);
  return reason;
}

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
  const [hasErrors, setHasErrors] = useState(false);

  const getFormFieldValueByName = (name) => {
    switch (name) {
    case 'headline':
      return headline;
    case 'link':
      return link;
    case 'date':
      return date;
    case 'content':
      return content;
    case 'links':
      return links;
    case 'label':
      return label;
    case 'tags':
      return taggedDatasets;
    default:
      return undefined;
    }
  }

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
    // Is the form dirty?
    const fields = [
      initialValues.headline !== headline,
      initialValues.link !== link,
      initialValues.date !== date,
      (initialValues.body && initialValues.body.content) !== content,
      ((initialValues.label || '') !== (label || '')),
      initialValues.view_status !== viewStatus
    ];
    const formDataChanged = fields.some (x => x);
    const tagsChanged = initialValues.tags.length !== taggedDatasets.length
          || initialValues.tags.every (t => !taggedDatasets.includes (t));

    const initialLinks = safePath (['body', 'links' ]) (initialValues) || [];

    const linksChanged = initialLinks.length + links.length > 0
          && (initialLinks.length !== links.length
              || initialLinks.some (l =>
                !links.find (ln =>
                  l.text === ln.text && l.url === ln.url )));

    setIsDirty (formDataChanged || tagsChanged || linksChanged);

    // Does the form have errors?
    const fieldErrors = Object.keys (validations).map ((name) => {
      const value = getFormFieldValueByName (name);
      const [hasError] = validations[name](value);
      return hasError;
    });
    const linkErrors = links.some (({ text, url }) => !(Boolean (text) && Boolean (url)))
    const formHasErrors = fieldErrors.some (x => x) || linkErrors;

    setHasErrors (formHasErrors);
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
    setTaggedDatasets (Array.from(tags))
  }

  const handleRemoveTag = (name) => {
    const tags = new Set (taggedDatasets);
    tags.delete (name);
    setTaggedDatasets (Array.from (tags));
  }

  // BODY CONTENT LINKS

  const debouncedSetLinks = debounce (500, (payload) => {
    setLinks (payload);
  });

  let updateLinks = (ix) => ({ text, url }) => {
    let newLinks = [...links];
    newLinks[ix] = { text, url };
    debouncedSetLinks(newLinks);
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

  // Update handlers with debounce
  // (otherwise input becomes sluggish)
  const debouncedUpdates = {
    headline: debounce (500, (event) => {
      setHeadline (event.target.value.trim());
    }),
    link: debounce (500, (event) => {
      setLink (event.target.value.trim());
    }),
    date: debounce (500, (event) => {
      setDate (event.target.value.trim());
    }),
    label: debounce (500, (event) => {
      setLabel (event.target.value.trim());
    }),
    content: debounce (500, (event) => {
      setContent (event.target.value.trim());
    }),
  };
  const updateField = (event) => {
    event.persist ();
    const fieldName = event.target.name;
    const updateFn = debouncedUpdates[fieldName];
    if (updateFn) {
      updateFn (event);
    }
  }

  const saveTooltip = hasErrors
        ? 'Form has validation errors'
        : !isDirty
        ? 'No fields have changed'
        : 'Save to database';

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
            error={hasError ('headline') (headline)}
            helperText={getHelpText ('headline') (headline)}
            label="Headline"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="headline"
            defaultValue={initialValues.headline}
            variant="outlined"
            onChange={updateField}
            fullWidth
          />
          <TextField
            classes={{
              root: classes.textField,
            }}
            error={hasError ('link') (link)}
            helperText={getHelpText ('link') (link)}
            label={`Link (${lt})`}
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="link"
            defaultValue={initialValues.link}
            variant="outlined"
            onChange={updateField}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            error={hasError ('date') (date)}
            helperText={getHelpText ('date') (date)}
            label="Display Date"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="date"
            defaultValue={initialValues.date}
            variant="outlined"
            onChange={updateField}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            error={hasError ('label') (label)}
            helperText={getHelpText ('label') (label)}
            label="Label"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="label"
            // value={label}
            defaultValue={initialValues.label}
            variant="outlined"
            onChange={updateField}
            fullWidth
          />

          <TextField
            classes={{
              root: classes.textField,
            }}
            error={hasError ('content') (content)}
            helperText={getHelpText ('content') (content)}
            label="Content"
            InputLabelProps={{ shrink: true, disableAnimation: true }}
            name="content"
            defaultValue={initialValues.body.content}
            variant="outlined"
            onChange={updateField}
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
            <Tooltip title={saveTooltip}>
              <span>
                <WhiteButtonSM
                  onClick={save}
                  disabled={!isDirty || hasErrors}
                  className={(isDirty && !hasErrors) ? classes.readyToSave: ''}>
                  Save
                </WhiteButtonSM>
              </span>
            </Tooltip>
            <WhiteButtonSM onClick={reset}>Cancel</WhiteButtonSM>
          </div>
        </div>
      </div>


      {/* child 3*/}
      <div className={classes.taggerContainer}>
        <DatasetTagger
          tags={taggedDatasets}
          addDataset={handleAddTag}
          removeDataset={handleRemoveTag}
          editState={{ headline, link, content, links }}
        />
        </div>

      {/* child 4*/}
      {/* to enable sending notification, news item must be published and not have pending updates */}
      <div className={classes.emailContainer}>
        <EmailManager
          newsId={storyState && storyState.id}
          modDate={storyState && storyState.modify_date}
          tags={taggedDatasets}
          headline={headline}
          enabled={{
            isDirty,
            viewStatus,
          }}
        />
      </div>

    </div>
  );
};

export default Editor;
