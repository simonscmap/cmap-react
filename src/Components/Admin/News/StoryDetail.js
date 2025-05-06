import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '../../Home/theme';
import { TealButtonSM } from '../../Common/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import {
  publishNewsItem,
  draftNewsItem,
  previewNewsItem,
  unpublishNewsItem,
} from '../../../Redux/actions/news';
import Editor from './Editor2';
import DateDetail from './DateDetail';

const Story = withStyles({
  storyDetails: {
    width: 'calc(100% - 25px)',
  },
  topLine: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    margin: '10px 0',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5em',
  },
  active: {
    backgroundColor: colors.blue.teal,
    color: 'black',
  },
})(({ story: storyState, classes, expand, onCancel }) => {
  let dispatch = useDispatch();
  let sortTerm = useSelector(({ news }) => news.sortTerm);

  let {
    create_date: createDate,
    modify_date: modifyDate,
    publish_date: publishDate,
    view_status: viewStatus,
    // Highlight: highlight,
    // Status_ID: storyCategory,
  } = storyState;

  let publish = () => dispatch(publishNewsItem(storyState.id));
  let preview = () => dispatch(previewNewsItem(storyState.id));
  let draft = () => dispatch(draftNewsItem(storyState.id));
  let unpublish = () => dispatch(unpublishNewsItem(storyState.id));
  // let feature = () => dispatch (featureNewsItem (storyState.ID));
  // let unfeature = feature; // this is a toggle
  // let categorize = (ev) => dispatch (categorizeNewsItem (storyState.ID, ev.target.value));
  // let updateHighlight = (ev) => (console.log (ev.target.value));
  let isDisabled = (status) => viewStatus === status;

  let labelToField = {
    created: 'create_date',
    modified: 'modify_date',
    published: 'publish_date',
  };
  let dates = [
    [modifyDate, 'modified'],
    [publishDate, 'published'],
    [createDate, 'created'],
  ];

  let nonSummaryDates = dates.filter(
    ([, label]) => labelToField[label] !== sortTerm,
  );

  if (!expand) {
    return '';
  }

  return (
    <div className={classes.storyDetails}>
      <div className={classes.topLine}>
        <div className={classes.topLineLeft}>
          <div className={classes.controls}>
            <TealButtonSM disabled={isDisabled(3)} onClick={publish}>
              Publish
            </TealButtonSM>
            <TealButtonSM disabled={isDisabled(2)} onClick={preview}>
              Preview
            </TealButtonSM>
            <TealButtonSM disabled={isDisabled(1)} onClick={draft}>
              Draft
            </TealButtonSM>
            <TealButtonSM disabled={isDisabled(0)} onClick={unpublish}>
              Hide
            </TealButtonSM>
          </div>
        </div>

        <div className={classes.topLineRight}>
          <div className={classes.dates}>
            {nonSummaryDates.map(([date, label]) => (
              <DateDetail date={date} label={label} key={`${label}`} />
            ))}
          </div>
        </div>
      </div>
      <Editor story={storyState} action="update" onCancel={onCancel} />
    </div>
  );
});

export default Story;
