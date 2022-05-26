import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import StorySummary from './StorySummary';
import clsx from 'clsx';

const Story = withStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'start',
    justifyContent: 'start',
    margin: '2em 0',
    borderRadius: '10px',
  },
  dragTarget: {
    opacity: '0.3',
    border: '2px dashed black'
  },
})(({ story: storyState, classes, dragPackage, ix, deRank }) => {
  let {
    onDragStart,
    onDragOver,
    onDrop,
    onDragLeave,
    dragState,
  } = dragPackage;

  let isDragTarget = dragState && dragState.draggedTo === ix;

  // NOTE: the draggable container only contains a StorySummary,
  // and not the StoryDetail; a Story can only be expanded when
  // the not in the Edit Ranks mode
  return (
    <div
      className={clsx(classes.container, isDragTarget ? classes.dragTarget : '')}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      data-position={ix}
    >
      <StorySummary
        story={storyState}
        deRank={deRank}
        ix={ix}
      />
    </div>
  );
});

export default Story;
