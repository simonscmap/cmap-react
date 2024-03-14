import React from 'react';

import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { GoDotFill } from "react-icons/go";
import { ErrorOutline } from '@material-ui/icons';

const IssueWithList = (props) => {
  const { text, list } = props
  return (
    <div>
    <Typography>{text}</Typography>
    <List dense>
    {list && list.map ((item, index) => (
      <ListItem key={`likey${index}`}>
      <ListItemIcon>
      <GoDotFill color="#69FFF2"/>
      </ListItemIcon>
      <ListItemText>
      {item}
      </ListItemText>
      </ListItem>
    ))}
    </List>
    </div>
  );
}

export default IssueWithList;
