import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Section, { Group } from '../../Common/Section';
import { useSelector, useDispatch } from 'react-redux';
import { WhiteButtonSM } from '../../Home/buttons';
import {
  setSortTerm,
  setRankFilter,
  setViewStateFilter,
  updateNewsRanks,
  setOpenRanksEditor,
  setOrderOfImportance,
} from '../../../Redux/actions/news';

const styles = () => ({
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

const Controls = (props) => {
  let { classes } = props;
  let active = classes.active;
  let dispatch = useDispatch();
  let sortTerm = useSelector(({ news }) => news.sortTerm);
  let viewStateFilter = useSelector(({ news }) => news.viewStateFilter);
  let rankFilter = useSelector(({ news }) => news.rankFilter);
  let openRanksEditor = useSelector(({ news }) => news.openRanksEditor);
  let orderOfImportance = useSelector(({ news }) => news.orderOfImportance);
  let ranks = useSelector(({ news }) => news.ranks);

  let accepts = (viewStatus) => {
    return viewStateFilter.includes(viewStatus);
  };

  // given a view state (0, 1, 2, or 3)
  // remove that state from the filter array if it is already present,
  // or add it to the array
  let updateFilters = (viewState) => {
    if (viewStateFilter.includes(viewState)) {
      let update = viewStateFilter.filter((s) => s !== viewState);
      dispatch(setViewStateFilter(update));
    } else {
      dispatch(setViewStateFilter([viewState, ...viewStateFilter]));
    }
  };

  let setOrder = () => {
    let newOrder =
      orderOfImportance === 'descending' ? 'ascending' : 'descending';
    dispatch(setOrderOfImportance(newOrder));
  };

  let setSort = (term) => dispatch(setSortTerm(term));

  let isSortedBy = (term) => {
    return sortTerm === term;
  };

  let saveRanks = () => {
    dispatch(updateNewsRanks(ranks))
    dispatch(setOpenRanksEditor(false));
  }

  return (
    <Section title="List Controls">
      <Group title="Filters">
        <div className={classes.controls}>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={accepts(3) ? active : ''}
            onClick={() => updateFilters(3)}
          >
            Published
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={accepts(2) ? active : ''}
            onClick={() => updateFilters(2)}
          >
            Preview
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={accepts(1) ? active : ''}
            onClick={() => updateFilters(1)}
          >
            Draft
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={rankFilter ? active : ''}
            onClick={() => dispatch(setRankFilter(!rankFilter))}
          >
            Ranked
          </WhiteButtonSM>
        </div>
      </Group>
      <Group title="Sort By">
        <div className={classes.controls}>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('simulate') ? active : ''}
            onClick={() => setSort('simulate')}
          >
            Simulate
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('view_status') ? active : ''}
            onClick={() => setSort('view_status')}
          >
            Publication Status
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('rank') ? active : ''}
            onClick={() => setSort('rank')}
          >
            Rank
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('modify_date') ? active : ''}
            onClick={() => setSort('modify_date')}
          >
            Modified Date
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('publish_date') ? active : ''}
            onClick={() => setSort('publish_date')}
          >
            Publication Date
          </WhiteButtonSM>
          <WhiteButtonSM
            disabled={openRanksEditor}
            className={isSortedBy('create_date') ? active : ''}
            onClick={() => setSort('create_date')}
          >
            Creation Date
          </WhiteButtonSM>
        </div>
      </Group>
      <Group title="Order">
        <WhiteButtonSM
          disabled={openRanksEditor}
          className={orderOfImportance === 'descending' ? active : ''}
          onClick={setOrder}
        >
          {orderOfImportance === 'descending' ? 'Descending' : 'Ascending'}
        </WhiteButtonSM>
      </Group>
      <Group title="Ranks">
        <div className={classes.controls}>
          <WhiteButtonSM
            className={openRanksEditor ? active : ''}
            onClick={() => dispatch(setOpenRanksEditor(!openRanksEditor))}
          >
            {openRanksEditor ? 'Close Rank Editor' : 'Edit Ranks'}
          </WhiteButtonSM>
          {openRanksEditor && (
            <WhiteButtonSM
              className={openRanksEditor ? active : ''}
              onClick={saveRanks}
            >
              Save Ranks
            </WhiteButtonSM>
          )}
        </div>
      </Group>
    </Section>
  );
};

export default withStyles(styles)(Controls);
