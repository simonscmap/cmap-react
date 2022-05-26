import React from 'react';
import Banner from '../../Common/Banner';
import { renderText, renderBody } from '../../Home/NewsBanner';
import newsBannerStyles from '../../Home/newsBannerStyles';
import Typography from '@material-ui/core/Typography';
import SlideOutPanel from '../../Common/SlideOutPanel';
import { useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  guideContainer: {
    '& h3': {
      padding: '1em 0',
    },
  },
  markdownSet: {
    display: 'flex',
    flexDirection: 'row',
    padding: '0.5em 0',
    justifyContent: 'space-between',
  },
  verticalSet: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5em 0',
    justifyContent: 'flex-start',
  },
  pair: {
    display: 'flex',
    flexDirection: 'row',
    padding: '0.5em 0',
    justifyContent: 'flex-start',
    '& p': {
      width: '150px',
    },
  },
  verticalPair: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.5em 0',
  },
  name: {
    width: '150px',
    '& h3': {
      color: 'rgba(255, 255, 255, 0.38)',
      fontSize: '18px',
      fontStyle: 'normal',
      fontFamily: 'Montserrat',
      fontWeight: '500',
      lineHeight: '22px',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    },
  },
  code: {
    width: '300px',
    lineHeight: '1.3em',
    fontSize: '1.25rem',
  },
  preview: {
    width: '300px',
  },
};

const MarkupSet = withStyles(styles)(({ classes, name, text, preview }) => {
  return (
    <div className={classes.markdownSet}>
      <div className={classes.name}>
        <Typography variant="h3">{name}</Typography>
      </div>
      <div className={classes.code}>
        <code>{text}</code>
      </div>
      <div className={classes.preview}>
        <Preview text={preview} />
      </div>
    </div>
  );
});

const LinkExample = withStyles(styles)(({ classes }) => {
  let bodyExample = {
    content: 'preview of a link: {0}',
    links: [{ text: 'Catalog', url: '/catalog' }],
  };

  return (
    <div className={classes.verticalSet}>
      <div className={classes.name}>
        <Typography variant="h3">Link Example</Typography>
      </div>
      <div>
        <div className={classes.pair}>
          <Typography variant="body2">Body Content:</Typography>
          <code>{bodyExample.content}</code>
        </div>
        <div className={classes.pair}>
          <Typography variant="body2">Link Text:</Typography>
          <code>{bodyExample.links[0].text}</code>
        </div>

        <div className={classes.pair}>
          <Typography variant="body2">Link URL:</Typography>
          <code>{bodyExample.links[0].url}</code>
        </div>
        <div className={classes.verticalPair}>
          <Typography variant="body2">Resulting JSON:</Typography>
          <code>
            <pre>{JSON.stringify(bodyExample, null, 2)}</pre>
          </code>
        </div>
      </div>
      <div className={classes.name}>
        <Typography variant="h3">Result</Typography>
      </div>
      <div className={classes.preview}>
        <Preview>{renderBody(bodyExample)}</Preview>
      </div>
    </div>
  );
});

const Preview = withStyles(newsBannerStyles)(({ classes, text, children }) => {
  let content = text ? renderText(text) : children;
  return (
    <div className={classes.newsCardContent}>
      <Typography variant="body1">{content}</Typography>
    </div>
  );
});

const Guide = withStyles(styles)((props) => {
  let { open, handleClose, classes } = props;
  let messages = useSelector(({ news }) => news.adminMessages);
  return (
    <SlideOutPanel open={open} handleClose={handleClose} title="Usage Guide">
      <div className={classes.guideContainer}>
        <Typography variant="h3">Markup</Typography>
        <Banner variant="blue">
          <MarkupSet
            name="Bold"
            text="markdown for *bold*"
            preview="preview of *bold*"
          />

          <MarkupSet
            name="Italic"
            text="markdown for /italic/"
            preview="preview of /italic/"
          />

          <MarkupSet
            name="Underline"
            text="markdown for _underline_"
            preview="preview of _underline_"
          />
          <MarkupSet
            name="Nested"
            text="*nested /markdown/ _styles_*"
            preview="*nested /markdown/ _styles_*"
          />
        </Banner>
        <Typography variant="h3">Links</Typography>
        <Typography variant="h6">How to insert a link</Typography>

        <Typography variant="body1">
          Links in the body can be inserted by including a set of curly braces
          surrounding a digit. Note that the value of the digit is not
          functional (it does not make a difference what the digit is), however
          this may be used to order links in the future.
        </Typography>

        <Banner variant="blue">
          <LinkExample />
        </Banner>
        <Typography variant="h6">External vs. Internal Links</Typography>

        <Typography variant="body1">
          Links can be external when they are fully qualified with a protocol,
          such as "http", but are internal and point to a page on CMAP when they
          begin with a forward slash "/".
        </Typography>

        <Typography variant="h3">Messages</Typography>
        <Typography variant="h6">
          Messages network operations will appear hear
        </Typography>

        <Banner variant="blue">
          {messages.length
            ? messages.map((msg, i) => (
                <Typography key={i} variant="body2">
                  {msg}
                </Typography>
              ))
            : 'No messages.'}
        </Banner>
      </div>
    </SlideOutPanel>
  );
});
export default Guide;
