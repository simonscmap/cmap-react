import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Page from '../Common/Page';
import Section, { FullWidthContainer } from '../Common/Section';
import Banner from '../Common/Banner';
import Split from '../Common/Split';
import List from '../Common/List';
import clsx from 'clsx';
import { colors } from '../Home/theme';
import ResizeObserver from 'react-resize-observer';

const jupyterNotebookURL =
  'https://nbviewer.org/github/klqi/seaflow_gallery/blob/main/SeaFlow%20Time%20Series%20Decomposition.ipynb';

const toA = ([text, href]) => (
  <a target="_blank" rel="noreferrer" href={href}>
    {text}
  </a>
);
const toCustomItem = (component) => ({ custom: component });

const links = [
  [
    'Github',
    'https://github.com/klqi/seaflow_gallery/blob/main/SeaFlow%20Time%20Series%20Decomposition.ipynbhttps://github.com/klqi/seaflow_gallery/blob/main/SeaFlow%20Time%20Series%20Decomposition.ipynb',
  ],
];

const styles = () => ({
  sectionGap: {
    marginBottom: '1.5em',
  },
  paragraphGap: {
    marginTop: '1em',
  },
  tallLines: {
    lineHeight: '1.9em',
  },
  noTopMargin: {
    marginTop: 0,
  },
  bullet: {
    display: 'inline-block',
    background: colors.green.lime,
    width: '12px',
    height: '12px',
    borderRadius: '6px',
    margin: '0 0.5em 0.1em 0',
  },
});

const Credit = withStyles(styles)(({ classes, children }) => {
  return (
    <div>
      <Typography variant="h6">Credit</Typography>
      {children}
    </div>
  );
});

const HeroContent = withStyles(styles)(({ classes }) => {
  return (
    <div>
      <Credit>
        <Typography variant="body2">
          Katherine Qi, Univerity of Washington
        </Typography>
      </Credit>
    </div>
  );
});

const Notebook = () => {
  let [innerWidth, setInnerWidth] = useState(1380);

  let onResize = (rect) => {
    console.log('on resize');
    let { width } = rect;
    setInnerWidth(width);
  };
  return (
    <Section title="">
      <ResizeObserver onResize={onResize}></ResizeObserver>
      <Typography variant="h5">
        <iframe
          id="documentation-frame"
          title="iframe title"
          width={innerWidth}
          height={window.innerHeight - 110}
          style={{ border: 0 }}
          src={jupyterNotebookURL}
        ></iframe>
      </Typography>
    </Section>
  );
};

const ExerciseDescription = ({ classes }) => {
  // let sectionText = clsx(classes.tallLines, classes.paragraphGap);
  return (
    <Page
      pageTitle={'SeaFlow cytometry and satellite data show relationship between daily estimated cellular growth, temperature, and PAR'}
      heroContent={<HeroContent />}
    >
      <FullWidthContainer bgVariant={'slate'}>
        <Notebook />
      </FullWidthContainer>
    </Page>
  );
};

export default withStyles(styles)(ExerciseDescription);

export const lessonConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
