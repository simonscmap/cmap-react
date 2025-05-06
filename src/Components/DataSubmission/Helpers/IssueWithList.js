import React from 'react';

import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { GoDotFill } from 'react-icons/go';
import renderText, {
  renderTextNoUnderlineConversion,
} from '../../Home/News/renderText';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    '& p': {
      margin: 0,
    },
    '& ul': {
      margin: 0,
      padding: 0,
    },
  },
}));

const IssueWithList = (props) => {
  const { text, list } = props;
  const cl = useStyles();
  return (
    <div className={cl.wrapper}>
      <Typography className={cl.noTextDecoration}>
        {renderText(text)}
      </Typography>
      <List dense>
        {list &&
          list.map((item, index) => (
            <ListItem key={`likey${index}`}>
              <ListItemIcon>
                <GoDotFill color="#69FFF2" />
              </ListItemIcon>
              <ListItemText>
                {renderTextNoUnderlineConversion(item)}
              </ListItemText>
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default IssueWithList;
