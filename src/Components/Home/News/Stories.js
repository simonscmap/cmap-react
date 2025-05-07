import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useLayoutEffect, useState } from 'react';
import Card from './Card';
import newsBannerStyles from './newsBannerStyles';
import Subscribe from '../../User/Subscriptions/SubscribeNews';

const useStyle = makeStyles(newsBannerStyles);

const NewsCategoryHeading = ({ title, extraMargin }) => {
  let classes = useStyle();
  let style = { marginTop: extraMargin ? '1em' : 0 };
  return (
    <div className={classes.newsTitle} style={style}>
      <Typography variant="h2">{title}</Typography>
    </div>
  );
};

const NewsSection = ({ stories }) => {
  let classes = useStyle();

  let [ref, setRef] = useState(null);
  let [intervalId, setIntervalId] = useState(null);

  useLayoutEffect(() => {
    if (ref) {
      const s = () =>
        ref.scroll({
          top: 445,
          left: 0,
          behavior: 'instant',
        });
      const id = setInterval(s, 100);
      setIntervalId(id);
    } else {
      // console.log ('ref is null')
    }
  }, [ref]);

  const handleScroll = () => {
    if (ref) {
      const pos = ref.scrollTop;
      if (pos < 400) {
        const scrollBack = () => {
          if (ref) {
            ref.scroll({
              top: 445,
              left: 0,
              behavior: 'instant',
            });
          }
        };
        setTimeout(scrollBack, 200);
      }
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return (
    <div className={classes.newsFlowContainer}>
      <div className={classes.sectionTitleContainer} id="news_title_bar">
        <NewsCategoryHeading title={'News'} />
        <Subscribe intro={true} />
      </div>
      <div
        id={'news-flow'}
        className={classes.newsFlow}
        ref={setRef}
        onScroll={handleScroll}
      >
        <div>
          {stories.map((story, idx) => (
            <Card key={`news-story-${idx}`} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsStories = ({ stories }) => {
  let classes = useStyle();
  return (
    <div className={classes.news}>
      <NewsSection stories={stories} />
      <div className={classes.sectionFooter}></div>
    </div>
  );
};

export default NewsStories;
