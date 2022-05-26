import React from 'react';
import StoryContainer from './StoryContainer';
import { useSelector } from 'react-redux';
import Section from '../../Common/Section';
import { sortStories } from './lib';

const StoryList = () => {
  let stories = useSelector(({ news }) => news.stories);
  let openRanksEditor = useSelector(({ news }) => news.openRanksEditor);
  let viewStateFilter = useSelector(({ news }) => news.viewStateFilter);
  let rankFilter = useSelector(({ news }) => news.rankFilter);
  let orderOfImportance = useSelector(({ news }) => news.orderOfImportance);
  let sortTerm = useSelector(({ news }) => news.sortTerm);

  let filteredStories = stories.filter(
    ({ view_status, rank }) =>
      viewStateFilter.includes(view_status) &&
      (!rankFilter || (rankFilter && typeof rank === 'number')),
  );
  let sortedStories = sortStories(sortTerm, filteredStories, orderOfImportance);

  if (openRanksEditor) {
    return '';
  } else {
    return (
      <Section title="News Items" textStyles={false}>
        {sortedStories.map((s, ix) => (
          <StoryContainer
            key={`${ix}:${s.ID}:${s.headline}`}
            story={s}
          ></StoryContainer>
        ))}
      </Section>
    );
  }
};

export default StoryList;
