import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import Page2 from './Common/Page2';
import { ToCBase } from './Common/TableOfContents';
import Section, { Group } from './Common/Section';
import Block from './Common/Block';

const styles = () => ({
  fontSize: '1.2em',

  sectionGap: {
    marginBottom: '1.5em',
    fontSize: '1.6rem',
  },
  tallLines: {
    lineHeight: '1.9em',
  },

  aboutWrapper: {
    '& h3': {
      fontSize: '1.9em',
      display: 'inline-block',
      // marginTop: '1em',
    },
    '& .MuiAccordion-root': {
      // background: 'transparent',
      '&::before': {
        //  background: 'none',
      },
    },
    '& .MuiPaper-elevation1': {
      // boxShadow: 'none',
    },
    '& .MuiIconButton-root': {
      '& .MuiSvgIcon-root': {
        //  fontSize: '1.9rem'
      },
    },
  },

  simons: {
    marginTop: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1em',
    '& img': {
      background: 'white',
    },
  },
});

const sections = {
  support: 'support',
  participate: 'participate',
  cite: 'cite',
  people: 'people',
};

const About = ({ classes }) => {
  let [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Page2 pageTitle={'About Simons CMAP'} bgVariant="slate2">
      <Section>
        <Typography variant="subtitle1" className={classes.sectionGap}>
          Simons CMAP is an <em>open-source data portal</em> designed for
          retrieving, visualizing, and analyzing diverse ocean datasets
          including research cruise-based and autonomous measurements of
          biological, chemical and physical properties, multi-decadal global
          satellite products, and output from global-scale biogeochemical
          models.
        </Typography>
        <Typography variant="h5" className={classes.tallLines}>
          CMAP enables scientists and the public to dive into the vast, and{' '}
          <em>often underutilized</em>, ocean datasets and to view and retrieve
          customized subsets of these massive datasets without going through the
          time-consuming process of finding and harmonizing data from different
          sources.
        </Typography>
      </Section>

      <Section>
        <div className={classes.aboutWrapper}>
          <Accordion
            expanded={expanded === sections.people}
            onChange={handleChange(sections.people)}
            data-focus={sections.people}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">People</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Group title={'University of Washington, School of Oceanography'}>
                <Typography variant="body1">
                  Ginger Armbrust, Principal Investigator
                </Typography>
                <Typography variant="body1">
                  Mohammad D. Ashkezari (Project Lead), Principal Research
                  Scientist
                </Typography>
                <Typography variant="body1">
                  Tansy Burns, Research Coordinator
                </Typography>
                <Typography variant="body1">
                  Howard Wayne Kim, Web Engineer
                </Typography>
              </Group>
              <Group title="University of Washington, Department of Human Centered Design and Engineering">
                <Typography variant="body1">
                  Charlotte Lee, Associate Professor
                </Typography>
                <Typography variant="body1">
                  Andrew Neang, Ph.D. Candidate
                </Typography>
              </Group>
              <Group title="MIT, Department of Earth, Atmospheric, and Planetary Sciences">
                <Typography variant="body1">
                  Mick Follows, Professor and Director, Simons Collaboration on
                  Computational Biogeochemical Modeling of Marine Ecosystems
                </Typography>
                <Typography variant="body1">
                  Chris Hill, Principal Research Engineer
                </Typography>
              </Group>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === sections.cite}
            onChange={handleChange(sections.cite)}
            data-focus={sections.cite}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">How to cite</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Block>
                <code>
                  Ashkezari, M.D., Hagen, N.R., Denholtz, M., Neang, A., Burns,
                  T.C., Morales, R.L., Lee, C.P., Hill, C.N. and Armbrust, E.V.
                  (2021), Simons Collaborative Marine Atlas Project (Simons
                  CMAP): An open-source portal to share, visualize, and analyze
                  ocean data. Limnol Oceanogr Methods, 19: 488-496.
                  https://doi.org/10.1002/lom3.10439
                </code>
              </Block>
              <Typography variant="body1">
                DOI or relevant citations for specific data sets can be found in
                the Data Catalog or in the retrieved metadata.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === sections.participate}
            onChange={handleChange(sections.participate)}
            data-focus={sections.participate}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">How to participate</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Group title="Submit Data" titleLink={'/datasubmission/guide'}>
                <Typography variant="body1">
                  Data submitted to Simons CMAP is formatted to maintain high
                  levels of discoverability, comparability, and database
                  performance.
                </Typography>
                <Typography variant="body1">
                  The data submission toolset provides automated, immediate
                  feedback to assist you in formatting your submission, to
                  facilitate communication with the data curation team, and to
                  allow you to track the progress of your submission.
                </Typography>
                <Typography variant="body1">
                  Submitted datasets undergo final manual curation thus ensuring
                  the highest quality of data available through Simons CMAP.
                </Typography>
              </Group>
              <Group title="Open Source SDKs" titleLink={'/documentation'}>
                <Typography variant="body1">
                  Simons CMAP supports popular programming languages used for
                  data analysis and seamlessly blends into your existing
                  codebase. Review the{' '}
                  <Link to="/documentation">documentation</Link> to discover how
                  to retrieve, visualize, and analyze the CMAP data sets using
                  your preferred language. Please join us and contribute to
                  growing the CMAP data and software ecosystem.
                </Typography>
                <Typography variant="body1">
                  Contribute to our open source SDKs on Github:
                </Typography>
                <ToCBase
                  pageName={'about-sdks'}
                  links={[
                    {
                      text: 'pycmap (Python)',
                      href: 'https://github.com/simonscmap/pycmap',
                    },
                    {
                      text: 'cmapr (R)',
                      href: 'https://github.com/simonscmap/cmap4r',
                    },
                    {
                      text: 'matcmap (Matlab)',
                      href: 'https://github.com/simonscmap/matcmap',
                    },
                  ]}
                />
                <Typography variant="body1">
                  Provide feedback and ask questions about our SDKs via{' '}
                  <Link to="https://join.slack.com/t/simons-cmap/shared_invite/enQtNjQzMTkzMjg0NjQ2LTdlOGRhZjNhMDY3MjRlNjg2OTY5NzE3ZWZhNWE0OWZhYmQzMTJjNDkyNDQ1MjNkZDg0N2MzMzhlZDliNGYxYzQ">
                    Slack
                  </Link>
                </Typography>
              </Group>
            </AccordionDetails>
          </Accordion>

          <div className={classes.simons}>
            <img src="/images/simons-foundation-logo.svg" width="200px" />
            <Typography variant="body1">
              This project is supported by the Simons Foundation
            </Typography>
          </div>
        </div>
      </Section>
    </Page2>
  );
};

export default withStyles(styles)(About);

export const aboutConfig = {
  route: '/about',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
