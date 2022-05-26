import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import StorySummary from './StorySummary';
import StoryDetail from './StoryDetail';

const Story = withStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    margin: '2em 0',
  },
})(({ story: storyState, classes }) => {
  let [expand, setExpand] = useState(false);
  let toggle = () => setExpand(!expand)
  return (
    <div className={classes.container}>
      <StorySummary story={storyState} toggle={toggle} />
      <StoryDetail story={storyState} expand={expand} onCancel={() => setExpand(false)} />
    </div>
  );
});

export default Story;
