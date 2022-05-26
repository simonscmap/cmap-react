import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { colors, pxToRem } from '../../Home/theme';
import { WhiteButtonSM } from '../../Common/Buttons';
import { useDispatch } from 'react-redux';
import { createNewsItem, updateNewsItem } from '../../../Redux/actions/news';
import { Card } from '../../Home/NewsBanner';

export const linkType = (link) => {
  if (typeof link !== 'string') {
    return 'Unknown';
  } else if (link.slice(0, 4) === 'http') {
    return 'External';
  } else if (link.slice(0, 1) === '/') {
    return 'Internal';
  } else {
    return 'Unknown';
  }
};

const LinkEditor = withStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    '& label': {
      fontSize: '17px',
    },
  },
  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: colors.blue.dark,
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
})(({ classes, link, onChange }) => {
  let { text, url } = link;
  let [t, setT] = useState(text);
  let [u, setU] = useState(url);
  useEffect(() => {
    let update = { text: t, url: u };
    onChange(update);
  }, [t, u]);

  return (
    <div className={classes.container}>
      <TextField
        classes={{
          root: classes.textField,
        }}
        name="text"
        label={'Link Text'}
        InputLabelProps={{ shrink: true, disableAnimation: true }}
        defaultValue={text}
        variant="outlined"
        onChange={(ev) => setT(ev.target.value)}
        fullWidth
      />
      <TextField
        classes={{
          root: classes.textField,
        }}
        label={`URL (${linkType(url)})`}
        InputLabelProps={{ shrink: true, disableAnimation: true }}
        name="url"
        defaultValue={url}
        variant="outlined"
        onChange={(ev) => setU(ev.target.value)}
        fullWidth
      />
    </div>
  );
});

const Editor = withStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    margin: '2em 0',
  },
  panelContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    gap: '2em',
    margin: '1em 0',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'start',
  },
  cardBackdrop: {
    margin: '0 0 1em 0',
    // padding: '30px',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 'calc(100% - 30px)',
    background: 'linear-gradient(293.11deg, #4D0E64 10.23%, #723B85 92.6%)',
    borderRadius: '6px',
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 2,
    padding: '10px',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 'calc(100% - 30px)',
    background: '#07274D',
    borderRadius: '6px',
  },

  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5em',
  },

  textField: {
    border: `1px solid ${colors.blue.slate}`,
    borderRadius: '4px',
    background: colors.blue.dark,
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
})(({ story: storyState, action, classes, onSubmit, onCancel }) => {
  let initialValues = storyState
    ? storyState
    : {
        view_status: 2,
        headline: '',
        link: '',
        date: '',
        body: {
          content: '',
          links: [],
        },
      };

  let [viewStatus, setViewStatus] = useState(initialValues.view_status);
  let [headline, setHeadline] = useState(initialValues.headline);
  let [link, setLink] = useState(initialValues.link);
  // let [rank, setRank] = useState(storyState.rank);
  let [date, setDate] = useState(initialValues.date);
  let [content, setContent] = useState(
    initialValues.body ? initialValues.body.content : '',
  );
  let [links, setLinks] = useState(
    initialValues.body ? initialValues.body.links : [],
  );

  useEffect(() => {
    // update if story state changes in props
    if (storyState) {
      if (storyState.view_status) {
        setViewStatus(storyState.view_status);
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
  }, [storyState]);

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
  }
  // PAYLOAD

  let editState = {
    ...initialValues,
    view_status: viewStatus,
    headline,
    link,
    date,
    body: {
      content,
      links,
    },
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
      // TODO reset form
    }
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
  };

  let reset = () => {
    if (storyState) {
      if (storyState.view_status) {
        setViewStatus(storyState.view_status);
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
    } else {
      setViewStatus(2);
      setHeadline('');
      setLink('');
      setDate('');
      setContent('');
      setLinks([]);
    }
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  let lt = linkType(link);
  return (
    <div className={classes.panelContainer}>
      <div className={classes.first}>
        <div className={classes.cardContainer}>
          <div className={classes.cardBackdrop}>
            <Card story={editState} position={0} />
          </div>
        </div>
      </div>

      <div className={classes.editor}>
        <TextField
          classes={{
            root: classes.textField,
          }}
          label="Headline"
          InputLabelProps={{ shrink: true, disableAnimation: true }}
          name="headline"
          defaultValue={headline}
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
          defaultValue={link}
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
          defaultValue={date}
          variant="outlined"
          onChange={(ev) => setDate(ev.target.value)}
          fullWidth
        />

        <TextField
          classes={{
            root: classes.textField,
          }}
          label="Content"
          InputLabelProps={{ shrink: true, disableAnimation: true }}
          name="content"
          defaultValue={content}
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
  );
});

export default Editor;
