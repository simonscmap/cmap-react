import React, { useEffect, useState } from 'react';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Button from '@material-ui/core/Button';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { homeTheme } from '../../Home/theme';
import Footer from '../../Home/Footer';
import { FullWidthContainer, SectionTitle } from '../../Common/Section';
import { requestNewsList } from '../../../Redux/actions/news';
import { fetchDatasetNames } from '../../../Redux/actions/catalog';
import { previewStories } from './lib';
import NewsBanner from '../../Home/News';
import StoryList from './StoryList';
import Controls from './Controls';
import Create from './Create';
import EditRankDraggableList from './EditRanksDraggableList';
import Guide from './Guide';

const styles = (theme) => ({
  preview: {
    marginBottom: '2em',
  },
  titleSection: {
    padding: '0 0 50px 0',
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
  split: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2em',
    width: 'calc(100% - 80px)', // mimic section width adjustment
    maxWidth: '1870px', // ditto
    margin: 'auto',
  },
  primary: {
    flex: 1,
  },
  secondary: {
    padding: '1em',
    minWidth: '400px',
  },
  guideBttn: {
    padding: '3px 10px',
    borderRadius: '2em',
    float: 'right',
    borderColor: theme.palette.secondary.main,
    color: 'white',
  },
  messages: {
    marginTop: '1em',
    maxHeight: '200px',
    overflowY: 'scroll',
  },
  spacer: {
    height: '100px',
  },
});

const Dashboard = (props) => {
  let { classes } = props;
  let dispatch = useDispatch();

  // redirect if user is not logged in
  // or if user is not an admin
  let user = useSelector((state) => state.user);
  let messages = useSelector(({ news }) => news.adminMessages);
  let history = useHistory();

  if (!user) {
    history.push('/login?redirect=admin/news');
  } else if (!user.isDataSubmissionAdmin) {
    history.push('/');
  }

  useEffect(() => {
    // do this once
    dispatch(requestNewsList());
    dispatch(fetchDatasetNames());
  }, []);

  const [guideOpen, setGuideOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // pass stories into the news banner
  let stories = useSelector((state) => state.news.stories);
  let preview = previewStories(stories);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.pageContainer}>
        <FullWidthContainer
          bgVariant={'slate2'}
          minWidth={950}
          paddingTop={150}
        >
          <div className={classes.split}>
            <div className={classes.primary}>
              <SectionTitle title={'News Admin'} />
              <Accordion
                expanded={previewOpen}
                onChange={() => setPreviewOpen(!previewOpen)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Expand to See News Preview
                </AccordionSummary>
                <AccordionDetails>
                  <div className={classes.preview}></div>
                  <NewsBanner stories={preview} />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className={classes.secondary}>
              <Guide open={guideOpen} handleClose={() => setGuideOpen(false)} />
              <Button
                className={classes.guideBttn}
                variant="outlined"
                onClick={() => setGuideOpen(true)}
              >
                Open Usage Guide
              </Button>

              <Typography variant="h3">Event Log</Typography>
              <div className={classes.messages}>
                {messages.length
                  ? messages.map((msg, i) => (
                      <Typography key={i} variant="body2">
                        {msg}
                      </Typography>
                    ))
                  : 'No messages.'}
              </div>
            </div>
          </div>

          <Create />
          <Controls />
          <StoryList />
          <EditRankDraggableList />
          <div className={classes.spacer}></div>
        </FullWidthContainer>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default withStyles(styles)(Dashboard);
