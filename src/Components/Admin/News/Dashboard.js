import React, { useEffect, useState } from 'react';
import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { homeTheme } from '../../Home/theme';
import Footer from '../../Home/Footer';
import Section, { FullWidthContainer } from '../../Common/Section';
import { useDispatch, useSelector } from 'react-redux';
import { requestNewsList } from '../../../Redux/actions/news';
import { previewStories } from './lib';
import { useHistory } from 'react-router-dom';
import NewsBanner from '../../Home/NewsBanner';
import StoryList from './StoryList';
import Controls from './Controls';
import Create from './Create';
import EditRankDraggableList from './EditRanksDraggableList';
import Link from '@material-ui/core/Link';
import Guide from './Guide';

const styles = () => ({
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
    dispatch(requestNewsList());
  }, []);

  let [guideOpen, setGuideOpen] = useState(false);

  // pass stories into the news banner
  let stories = useSelector((state) => state.news.stories);
  let preview = previewStories(stories);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.pageContainer}>
        <FullWidthContainer bgVariant={'royal'} minWidth={950}>
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
            <NewsBanner stories={preview} />
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
