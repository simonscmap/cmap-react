import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Page from './Common/Page';
import TableOfContents, { ToCBase } from './Common/TableOfContents';
import Section, { FullWidthContainer, Group } from './Common/Section';
import Banner from './Common/Banner';
import Block from './Common/Block';
import { Link } from 'react-router-dom';

const styles = () => ({
  sectionGap: {
    marginBottom: '1.5em',
    fontSize: '1.6rem',
  },
  tallLines: {
    lineHeight: '1.9em',
  },
});

const tocList = [
  {
    text: 'Project Support',
    bookmark: 'support',
  },
  {
    text: 'How to Cite Simons CMAP',
    bookmark: 'cite',
  },
  { text: 'People', bookmark: 'people' },
  { text: 'Participate', bookmark: 'participate' },
];

const HeroContent = withStyles(styles)(({ classes }) => (
  <div>
    <Typography variant="subtitle1" className={classes.sectionGap}>
      Simons CMAP is an <em>open-source data portal</em> designed for
      retrieving, visualizing, and analyzing diverse ocean datasets including
      research cruise-based and autonomous measurements of biological, chemical
      and physical properties, multi-decadal global satellite products, and
      output from global-scale biogeochemical models.
    </Typography>
    <Typography variant="h5" className={classes.tallLines}>
      CMAP enables scientists and the public to dive into the vast, and{' '}
      <em>often underutilized</em>, ocean datasets and to view and retrieve
      customized subsets of these massive datasets without going through the
      time-consuming process of finding and harmonizing data from different
      sources.
    </Typography>

    <Banner>
      <TableOfContents
        pageName={'about'}
        title={'On this page'}
        links={tocList}
      />
    </Banner>
  </div>
));

const About = ({ classes }) => {
  return (
    <Page pageTitle={'About Simons CMAP'} heroContent={<HeroContent />}>
      <FullWidthContainer bgVariant={'slate'}>
        <Section name={'support'} title={'Project Support'}>
          <Typography variant="body1">
            This project is supported by the Simons Foundation
          </Typography>
        </Section>

        <Section name={'cite'} title={'How to cite Simons CMAP'}>
          <Group title={'How to cite data'}>
            <Typography variant="body1">
              DOI or relevant citations for specific data sets can be found in
              the Data Catalog or in the retrieved metadata.
            </Typography>
          </Group>
          <Group title={'How to cite use'}>
            <Typography variant="body1">
              To cite use of Simons CMAP please reference this 2021 manuscript
              that describes Simons CMAP:
            </Typography>
            <Block>
              <code>Ashkezari, M.D., Hagen, N.R., Denholtz, M., Neang, A., Burns,
              T.C., Morales, R.L., Lee, C.P., Hill, C.N. and Armbrust, E.V.
              (2021), Simons Collaborative Marine Atlas Project (Simons CMAP):
              An open-source portal to share, visualize, and analyze ocean data.
              Limnol Oceanogr Methods, 19: 488-496.
              https://doi.org/10.1002/lom3.10439</code>
            </Block>
          </Group>
        </Section>

        <Section name={'participate'} title={'Participate in CMAP'}>
          <Group title={'Submit data'} titleLink={'/datasubmission/guide'}>
            <Typography variant="body1">
              Data submitted to Simons CMAP is formatted to maintain high levels
              of discoverability, comparability, and database performance.
            </Typography>
            <Typography variant="body1">
              The data submission toolset provides automated, immediate feedback
              to assist you in formatting your submission, to facilitate
              communication with the data curation team, and to allow you to
              track the progress of your submission.
            </Typography>
            <Typography variant="body1">
              Submitted datasets undergo final manual curation thus ensuring the
              highest quality of data available through Simons CMAP.
            </Typography>
          </Group>
          <Group title={'Access data'} titleLink={'/catalog'}>
            <Typography variant="body1">
              Use the Catalog page to search/filter and select a dataset of
              interest for download. You can also tag datasets as “favorites” to
              easily visualize variables of interest via the Charts and Plots
              visualization page.
            </Typography>
          </Group>
          <Group title={'Visualize Data'} titleLink={'/visualize'}>
            <Typography variant="body1">
              Use the Charts and Plots visualization page to search/filter,
              select, and plot your variable of interest. You can download the
              resulting plots or download the data underlying the plots to
              create your own customized visuals.
            </Typography>
            <Typography variant="body1">
              Use the Explore Cruises visualization page to search for a cruise
              of interest and access all associated data sets from the catalog.
              From here you can select an associated dataset to download, or tag
              a dataset as a “favorite” and visualize selected variables from a
              cruise within the Charts and Plots page.
            </Typography>
          </Group>
          <Group title={'Open Source SDKs'}>
            <Typography variant="body1">
              Simons CMAP supports popular programming languages used for data
              analysis and seamlessly blends into your existing codebase. Review
              the <Link to="/documentation">documentation</Link> to discover how
              to retrieve, visualize, and analyze the CMAP data sets using your
              preferred language. Please join us and contribute to growing the
              CMAP data and software ecosystem.
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
                  text: 'cmap.jl (Julia)',
                  href: 'https://github.com/simonscmap/CMAP.jl',
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
        </Section>

        <Section name={'people'} title={'People'}>
          <Group title={'University of Washington, School of Oceanography'}>
            <Typography variant="body1">
              Ginger Armbrust, Principal Investigator
            </Typography>
            <Typography variant="body1">
              Mohammad D. Ashkezari, Principal Research Scientist
            </Typography>
            <Typography variant="body1">
              Tansy Burns, Research Coordinator
            </Typography>
            <Typography variant="body1">Diana Haring, Data Engineer</Typography>
            <Typography variant="body1">
              Walker Malling, Web Engineer
            </Typography>
            <Typography variant="body1">
              Rhonda Morales, Research Scientist
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
        </Section>
      </FullWidthContainer>
    </Page>
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
