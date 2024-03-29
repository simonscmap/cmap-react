import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Card from './Card';
import newsBannerStyles from './newsBannerStyles';

const useStyle = makeStyles(newsBannerStyles);

const NewsCategoryHeading = ({ title, extraMargin }) => {
  let classes = useStyle();
  let style = { marginTop: extraMargin ? '1em' : 0 };
  return (<div className={classes.newsTitle} style={style} >
    <Typography variant="h2">{title}</Typography>
  </div>);
}

const NewsSection = ({ stories }) => {
  let classes = useStyle();

  return (
    <div className={classes.newsFlow}>
    <div>
      {stories
        .map((story, idx) => (
          <Card
            key={`news-story-${idx}`}
            story={story}
          />
        ))}
    </div>
    </div>
  );
}

const NewsStories = ({ stories }) => {
  let classes = useStyle();
  return (
    <div className={classes.news}>
      <NewsSection stories={stories} />
      <div className={classes.sectionTitleContainer}>
        <NewsCategoryHeading title={"News"} />
      </div>
      <div className={classes.sectionFooter}>
      </div>
    </div>
  );
};

export default NewsStories;
