import React, { useEffect, useState } from 'react';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Link from '@material-ui/core/Link';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { homeTheme } from '../../Home/theme';
import Footer from '../../Home/Footer';
import Section, { FullWidthContainer } from '../../Common/Section';
import { requestNewsList } from '../../../Redux/actions/news';
import { fetchDatasetNames } from '../../../Redux/actions/catalog';
import { fetchNotificationHistory } from '../../../Redux/actions/notifications';
import { previewStories } from './lib';
import NewsBanner from '../../Home/News';
import StoryList from './StoryList';
import Controls from './Controls';
import Create from './Create';
import EditRankDraggableList from './EditRanksDraggableList';
import Guide from './Guide';

const styles = () => ({
  preview: {
    marginBottom: '2em',
  },
  titleSection: {
    padding: '150px 0 50px 0',
  },
  pageContainer: {
    width: '100%',
    color: '#ffffff',
  },
  active: {
    backgroundColor: 'white',
    color: 'black',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
  },
});

const Dashboard = (props) => {
  let { classes } = props;
  let dispatch = useDispatch();

  // redirect if user is not logged in
  // or if user is not an admin
  let user = useSelector((state) => state.user);
  let history = useHistory();

  if (!user) {
    history.push('/login?redirect=admin/news');
  } else if (!user.isDataSubmissionAdmin) {
    history.push('/');
  }

  useEffect(() => {
    // do this once
    dispatch (requestNewsList ());
    dispatch (fetchDatasetNames ());
    dispatch (fetchNotificationHistory ());
  }, []);

  const [guideOpen, setGuideOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // pass stories into the news banner
  let stories = useSelector((state) => state.news.stories);
  let preview = previewStories(stories);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.pageContainer}>
        <FullWidthContainer bgVariant={'slate2'} minWidth={950}>
          <Section>
            <div className={classes.titleSection}>
              <Typography variant="h1">News Admin</Typography>
            </div>
            <Link
              component="button"
              variant="body2"
              onClick={() => setGuideOpen(true)}
              style={{ color: 'white'}}
            >
              Open usage guide.
            </Link>
          </Section>

          <Guide open={guideOpen} handleClose={() => setGuideOpen(false)} />
          <Section title="Preview" textStyles={false}>
            <Accordion expanded={previewOpen} onChange={() => setPreviewOpen(!previewOpen)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}></AccordionSummary>
              <AccordionDetails>
                <div className={classes.preview}></div>
                <NewsBanner stories={preview} />
                </AccordionDetails>
            </Accordion>
          </Section>

          <Create />
          <Controls />
          <StoryList />
          <EditRankDraggableList />
        </FullWidthContainer>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default withStyles(styles)(Dashboard);
