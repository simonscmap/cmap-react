import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import StoryContainer from './StoryContainer';
import Section from '../../Common/Section';
import { WhiteButtonSM as Button } from '../../Common/Buttons';
import { SpinnerWrapper } from '../../UI/Spinner';
import { sortedStories as storiesSelector } from './newsSelectors';

const useStyles = makeStyles((theme) => ({
  pageControls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    gap: '1em',
  },
}));

const StoryList = () => {
  const cl = useStyles ();
  const openRanksEditor = useSelector(({ news }) => news.openRanksEditor);
  const sortedStories = useSelector (storiesSelector);

  // pagination
  const numPages = Math.floor(sortedStories.length / 5);
  const [page, setPage] = useState(0)

  const prev = () => {
    if (page > 0) {
      setPage (page - 1);
    }
  }

  const next = () => {
    if (page < numPages) {
      setPage (page + 1);
    }
  }

  if (openRanksEditor) {
    return '';
  } else if (sortedStories.length === 0) {
    return <SpinnerWrapper message={'Loading News Items...'} />
  } else {
    return (
      <Section title="News Items" textStyles={false}>
        <div className={cl.pageControls}>
          <Button onClick={prev}>Prev</Button>
          <Button onClick={next}>Next</Button>
          <span>News Items {page * 5 + 1} through {page * 5 + 5}</span>
        </div>
        <div>
          {sortedStories.slice ((page * 5), (page * 5 + 5)).map((s, ix) => (
          <StoryContainer
            key={`${ix}:${s.ID}:${s.headline}`}
            story={s}
          ></StoryContainer>
        ))}
        </div>
        <span className={cl.info}>Page {page} of {numPages}</span>
      </Section>
    );
  }
};

export default StoryList;
