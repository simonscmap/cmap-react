import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { GreenButton } from './buttons';
import featureGridStyles from './featureGridStyles';
import Section from './GridSection';
import { useHistory } from 'react-router-dom';

let sections = {
  findData: {
    id: 'findData',
    variant: 'right',
    title: 'Find Data',
    text:
      'Search the catalog to find and download datasets matching your unique interests.',
  },
  accessData: {
    id: 'accessData',
    variant: 'left',
    title: 'Access Data',
    text:
      'Review the documentation to discover how to retrieve, visualize, and analyze CMAP dataset using your preferred language.',
  },
  visualizeData: {
    id: 'visualizeData',
    variant: 'right',
    title: 'Visualize Data',
    text:
      'Find and plot variables matching your unique interests, or use the ‘cruise view’ to explore datasets based on oceanographic cruises.',
  },
  submitData: {
    id: 'submitData',
    variant: 'left',
    title: 'Submit Data',
    text:
      'Add your own data, or request that a public dataset be added to Simons CMAP.',
  },
};

const FeatureGrid = (props) => {
  let { classes } = props;
  let history = useHistory();
  // Note: Link must have color="inherit" to receive color from Typography

  return (
    <div className={classes.featureGridOuterContainer}>
      <div className={classes.featureGridInnerContainer}>
        <Typography variant="h3" className={classes.h3adjust}>Get Started</Typography>

        <Typography variant="subtitle2">
          Simons CMAP simplifies marine data access and use by collecting and
          harmonizing satellite, in situ, and model data.
        </Typography>

        <Section sectionProps={sections.findData}>
          <GreenButton color="primary" onClick={() => history.push('/catalog')}>
            Catalog
          </GreenButton>
        </Section>

        <Section sectionProps={sections.accessData}>
          <GreenButton
            color="primary"
            onClick={() => history.push('/apikeymanagement')}
          >
            API Key
          </GreenButton>
          <GreenButton
            color="primary"
            onClick={() => history.push('/documentation')}
          >
            Documentation
          </GreenButton>
        </Section>

        <Section sectionProps={sections.visualizeData}>
          <GreenButton
            color="primary"
            onClick={() => history.push('/visualization/charts')}
          >
            Charts & Plots
          </GreenButton>
          <GreenButton
            color="primary"
            onClick={() => history.push('/visualization/cruises')}
          >
            Cruises
          </GreenButton>
        </Section>

        <Section sectionProps={sections.submitData}>
          <GreenButton
            color="primary"
            onClick={() => history.push('/datasubmission/guide')}
          >
            Submission Guide
          </GreenButton>
          <GreenButton
            color="primary"
            onClick={() => history.push('/datasubmission/nominate-data')}
          >
           Nominate New Data
          </GreenButton>
        </Section>
      </div>
    </div>
  );
};

export default withStyles(featureGridStyles)(FeatureGrid);
