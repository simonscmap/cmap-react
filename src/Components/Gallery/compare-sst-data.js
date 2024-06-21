import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../Common/Page';
import Section, { FullWidthContainer } from '../Common/Section';
import Banner from '../Common/Banner';
import Split from '../Common/Split';
import List from '../Common/List';
import clsx from 'clsx';
import { colors } from '../Home/theme';

const dropbox = {
  activityPlots: `https://www.dropbox.com/s/zzsa34bqon8pp17/Simons%20CMAP%20SST%20Activity%20Plots.docx?dl=0`,
  studentWorksheet: `https://www.dropbox.com/s/vqteh9iqquajnex/Simons%20CMAP%20SST%20Activity%20Student%20Worksheet.docx?dl=0`,
};
const toA = ([text, href]) => (
  <a target="_blank" rel="noreferrer" href={href}>
    {text}
  </a>
);
const toCustomItem = (component) => ({ custom: component });

const links = [
  ['Student Worksheet: Compare SST Data', dropbox.studentWorksheet],
  ['Instructor Resource: Compare SST Data Plots', dropbox.activityPlots],
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

const Credit = withStyles(styles)(({ classes, children}) => {
  return (<div><Typography variant="h6">Credit</Typography>{children}</div>);
});

const HeroContent = withStyles(styles)(({ classes }) => {
  let level = <List title="Level" items={[{ text: 'Undergraduate' }]} />;
  let activityType = (
    <List
      title="Type of Activity"
      items={[{ text: 'Classroom / Laboratory' }]}
    />
  );
  let resourceLinks = (
    <List title="Downloads" items={links.map(toA).map(toCustomItem)} />
  );
  return (
    <div>
      <Typography variant="subtitle1" className={classes.noTopMargin}>
        Using Simons CMAP to compare sea surface temperature data from different
        ocean observing methods
      </Typography>
      <Banner variant="blue">
        <Split items={[level, activityType, resourceLinks]}></Split>
    </Banner>
    <Credit>
    <Typography variant="body2">Sasha Seroy, Univerity of Washington</Typography>
    <Typography variant="body2">Tansy Clay Burns, University of Washington</Typography>
    </Credit>
    </div>
  );
});

const BulletedText = withStyles(styles)(({ classes, children }) => {
  return (
    <Typography
      variant="h5"
      className={clsx(classes.tallLines, classes.paragraphGap)}
    >
      <div className={classes.bullet}></div>
      {children}
    </Typography>
  );
});

const ExerciseDescription = ({ classes }) => {
  let sectionText = clsx(classes.tallLines, classes.paragraphGap);
  return (
    <Page
      pageTitle={'Activity: Compare SST Data'}
      heroContent={<HeroContent />}
    >
      <FullWidthContainer bgVariant={'slate'}>
        <Section title="Description">
          <Typography variant="h5" className={sectionText}>
            This activity introduces students to the Simons Collaborative Marine
            Atlas Project (Simons CMAP) data portal as a way to compare data
            from three different ocean observing methods (ships, autonomous
            vehicles, and satellites). Students use the data portal to visualize
            real sea surface temperature data collected using these methods to
            compare the scientific application of each in terms of its benefits
            and limitations, temporal and spatial scales, and environmental
            changes that can be observed. Students compare data from these
            methods at two locations, one tropical and one polar, to encourage
            thinking about the scales over which sea surface temperature changes
            occur in both locations and which methods are appropriate for
            observing which changes and processes.
          </Typography>
        </Section>
        <Section title="Learning Objectives">
          <Typography variant="h4" className={sectionText}>
            Discipline-specific goals
          </Typography>
          <BulletedText>
            Compare and contrast the benefits and limitations of different
            environmental data-collection platforms and their scientific
            applications
          </BulletedText>
          <BulletedText>
            Connect temperature data over time to underlying environmental
            processes
          </BulletedText>
          <BulletedText>
            Compare and contrast data from different platforms over different
            time scales and resolution
          </BulletedText>

          <Typography variant="h4" className={sectionText}>
            Skills
          </Typography>
          <BulletedText>
            Develop data interpretation and analysis skills
          </BulletedText>
          <BulletedText>
            Gain experience visualizing, comparing, and interpreting large
            real-world data sets
          </BulletedText>
        </Section>

        <Section title="Materials">
          <BulletedText>
            Students should have access to a computer for this activity (either
            through a computer lab or laptop brought to class)
          </BulletedText>
          <BulletedText>Student worksheet (see linked materials)</BulletedText>
        </Section>

        <Section title="Implementation">
          <Typography variant="h5" className={sectionText}>
            This activity was created for a 100-level undergraduate course on
            environmental monitoring and technology where many students were
            non-science majors. This was a culminating data lab at the end of
            the course where students were given the opportunity to compare and
            interpret data collected using different methods that were discussed
            throughout the course
          </Typography>
        </Section>

        <Section title="Reflection">
          <Typography variant="h5" className={sectionText}>
            This lesson successfully introduced students to accessible large
            data sets which fosters critical thinking skills surrounding
            real-world data. The ability to compare and contrast datasets helped
            students match data collection tools with the ability to observe
            different oceanographic processes that occur at varying scales of
            space and time. Students enjoyed the activity, reported that it was
            “fun”, “cool”, “awesome”, and expressed interest in working with
            real data and comparing and contrasting tools. The average grade on
            this activity was similar to other in class activities done in the
            course. I plan to continue using this activity in future iterations
            of the class.
          </Typography>
        </Section>
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
