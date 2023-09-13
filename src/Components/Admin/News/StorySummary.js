import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { colors } from '../../Home/theme';
import StoryStatus from './StoryStatus';
import DateDetail from './DateDetail';
import CancelIcon from '@material-ui/icons/Cancel';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import IconButton from '@material-ui/core/IconButton';
import { useSelector, useDispatch } from 'react-redux';
import { addRank } from '../../../Redux/actions/news';
import { toCategoryTitle } from '../../Home/News/newsCategories';
import clsx from 'clsx';

const Story = withStyles({
  overview: {
    width: 'calc(100% - 25px)',
    '& h4': {
      '&::after': {
        width: '100%',
        content: '""',
        display: 'block',
        height: '4px',
        background: colors.blue.dark,
        opacity: 0.7,
        marginTop: '2px',
      },
    },
  },
  handle: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  handleLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '20px',
  },
  handleRight: {},
  data: {
    height: '32px', // make the same height as status chip
    paddingBottom: '6px', // correct for baseline
    '& > p': {
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 500,
      display: 'inline-block',
    },
    '& > button': {
      display: 'inline-block',
      marginLeft: '15px',
      marginTop: '-7px',
      color: 'white',
    },
    '& > h5': {
      display: 'inline-block',
      marginLeft: '15px',
    },
  },
  data2: {
    'display': 'flex',
    'flexDirection': 'row',
    'justifyContent': 'flex-start',
    'alignContent': 'center',
    'alignItems': 'baseline',
    'gap': '.75em',
    '& > p': {
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 500,
    },
    '& h3': {
     fontSize: '1em',
    }
  },
  rankWidth: {
    width: '100px',
  },
  pinWidth: {
    width: '100px',
  },
  idWidth: {
    width: '100px',
  },
  deRankWidth: {
    width: '115px',
  },
  addRankWidth: {
    width: '100px',
  },
  correctLabelBaseline: {
    paddingBottom: '5px',
  },
  prospectiveRank: {
    '& > h5': {
      color: 'red',
    }
  }
})(({ story: storyState, classes, toggle, deRank, ix }) => {
  // NOTE deRank will only be passed as a prop when StorySummary
  // is used in the draggable list
  let {
    create_date: createDate,
    modify_date: modifyDate,
    publish_date: publishDate,
    view_status: viewStatus,
    headline,
    rank,
  } = storyState;

  let rankIsSet = typeof rank === 'number';

  let sortTerm = useSelector(({ news }) => news.sortTerm);
  let openRanksEditor = useSelector(({ news }) => news.openRanksEditor);
  let storyIsInAddRank = useSelector(({ news }) => news.addRank.some(({ ID }) => storyState.ID === ID ));

  let summaryDate = [modifyDate, 'modified'];
  if (sortTerm === 'create_date') {
    summaryDate = [createDate, 'created'];
  } else if (sortTerm === 'publish_date') {
    summaryDate = [publishDate, 'published'];
  }

  let dispatch = useDispatch();

  return (
    <div className={classes.overview}>
      <Typography variant="h4" onClick={toggle} style={{ cursor: 'pointer' }}>
        {headline}
      </Typography>
      <div className={classes.handle}>
        <div className={classes.handleLeft}>
          <StoryStatus status={viewStatus} />
          {rankIsSet && (
            <div className={clsx(classes.data, classes.rankWidth)}>
              <Typography variant="body2">rank</Typography>
              <Typography variant="h5">{rank + 1}</Typography>
            </div>
          )}
          {!rankIsSet && openRanksEditor && (
            <div className={clsx(classes.data, classes.rankWidth, classes.prospectiveRank)}>
              <Typography variant="body2">rank</Typography>
              <Typography variant="h5">{ix + 1}</Typography>
            </div>
          )}
          {!rankIsSet && !openRanksEditor && (
            <div className={clsx(classes.data, classes.pinWidth)}>
              <Typography variant="body2">pin</Typography>
              <IconButton disabled={storyIsInAddRank} onClick={() => dispatch(addRank({ ...storyState }))}>
                <FormatListNumberedIcon />
              </IconButton>
            </div>
          )}
          {deRank && (
            <div className={clsx(classes.data, classes.idWidth)}>
              <Typography variant="body2">id</Typography>
              <Typography variant="h5">{storyState.ID}</Typography>
            </div>
          )}
          {deRank && (
            <div className={clsx(classes.data, classes.deRankWidth)}>
              <Typography variant="body2">remove</Typography>
              <IconButton
                style={{ marginTop: '-9px' }}
                onClick={() => deRank(storyState.ID)}
              >
                <CancelIcon />
              </IconButton>
            </div>
          )}
          <div className={classes.data2}>
            <Typography variant="body2">category</Typography>
            <Typography variant="h3">{toCategoryTitle[storyState.Status_ID]}</Typography>
          </div>
        </div>
        <div className={classes.handleRight}>
          <div className={classes.dateSummary}>
            {summaryDate &&
              [summaryDate].map(([date, label]) => (
                <DateDetail date={date} label={label} key={`${label}`} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Story;
