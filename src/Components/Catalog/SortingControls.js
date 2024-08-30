import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { setSortingOptions } from '../../Redux/actions/catalog';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { TiSortAlphabetically } from "react-icons/ti";
import { TbSortAscending } from "react-icons/tb";
import { TbSortDescending } from "react-icons/tb";
import { AiOutlineHistory } from "react-icons/ai";

const useStyles = makeStyles((theme) => ({
  sortControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5em',
    '& button': {
      fontSize: '1.5em',
    }
  },
  root: {
    color: 'rgba(255,255,255,0.7)',
    '&.Mui-selected': {
      color: theme.palette.secondary.light,
    },
    '& div': {
      padding: 0,
      lineHeight: 0,
    }
  },
}));

const Sort = () => {
  const cl = useStyles();
  const dispatch = useDispatch();
  const { direction, field } = useSelector ((state) => state.catalogSortingOptions);


  const isAscending = direction === 'ASC';

  const changeDirection = () => {
    const newDirection = isAscending ? 'DESC' : 'ASC';
    dispatch (setSortingOptions ({ field, direction: newDirection }));
  }

  const handleFieldChange = (event, newField) => {
    if (!newField) {
      return;
    }
    dispatch (setSortingOptions ({ direction, field: newField }));
  };

  const [fieldState, setFieldState] = useState(field);

  useEffect (() => {
    setFieldState (field);
  }, [field]);

  return (
    <div className={cl.sortControls}>
      <ToggleButtonGroup
        value={fieldState}
        exclusive
        onChange={handleFieldChange}
      >
        <ToggleButton value="name" classes={{ root: cl.root }}>
          <Tooltip title={'Sort Alphabetically by Dataset Name'}>
            <div>
              <TiSortAlphabetically />
            </div>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="id" classes={{ root: cl.root }}>
          <Tooltip title={'Sort by Latest'}>
            <div>
              <AiOutlineHistory />
            </div>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title={isAscending ? 'Ascending' : 'Descending'}>
        <ToggleButton value="direction" selected={true} classes={{ root: cl.root }} onChange={changeDirection}>
          {isAscending ? <TbSortAscending /> : <TbSortDescending />}
        </ToggleButton>
      </Tooltip>

    </div>
  );
}

export default Sort;


export const sortResults = (results, options) => {
  const { direction, field } = options;
  const data = results.slice();

  const isAsc = direction === 'ASC';

  let f;
  switch (field) {
    case 'id':
      f = 'Dataset_ID';
      break;
    case 'name':
      f = 'Long_Name'
      break;
  }

  if (f) {
    data.sort((a, b) => {
      if (a[f] > b[f]) {
        return isAsc ? 1 : -1;
      } else if (a[f] < b[f]) {
        return isAsc ? -1 : 1;
      } else {
        return 0
      }
    });
  }

  return data;
};
