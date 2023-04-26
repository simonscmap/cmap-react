import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import Page from '../Common/Page';
import Section, { FullWidthContainer } from '../Common/Section';
import { colors } from '../Home/theme';
import ResizeObserver from 'react-resize-observer';

let nbviewerLink = 'https://nbviewer.org/github/simonscmap/pycmap/blob/master/docs/CruisePlan.ipynb';

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

const Credit = withStyles(styles)(({ children }) => {
  return (
    <div>
      <Typography variant="h6">Credit</Typography>
      {children}
    </div>
  );
});

const HeroContent = withStyles(styles)(() => {
  return (
    <div>
      <div style={{ marginBottom: '2em' }}>
        <a href="https://doi.org/10.5281/zenodo.7839055">
          <img
            src="https://zenodo.org/badge/DOI/10.5281/zenodo.7839055.svg"
            alt="DOI"
          />
        </a>

      </div>
      <Credit>
        <Typography variant="body2">
          Mohammad Ashkezari, Univerity of Washington
        </Typography>
        <Typography variant="body2">
          Ginger Armbrust, Univerity of Washington
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
          src={nbviewerLink}
        ></iframe>
      </Typography>
    </Section>
  );
};

const ExerciseDescription = () => {
  // let sectionText = clsx(classes.tallLines, classes.paragraphGap);
  return (
    <Page
      pageTitle={
        'Cruise Planning: Contemporaneous Sampling Along An Arbitrary Cruise Trajectory'
      }
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
