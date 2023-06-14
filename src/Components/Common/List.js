import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const styles = {
  listTitle: {
    whiteSpace: 'nowrap',
  },
};

const Item = ({ text, custom }) => {
  let content = text ? text : custom ? custom : '';
  return (
    <ListItem>
      <ListItemText>{content}</ListItemText>
    </ListItem>
  );
};

export const Base = withStyles(styles)((props) => {
  let { title, items, classes } = props;
  return (
    <div>
      <div className={classes.listTitle}>
        {title && <Typography variant="h3">{title}</Typography>}
      </div>
      <List>
        {items.map((itemProps, i) => (
          <Item key={`item-${i}`} {...itemProps} />
        ))}
      </List>
    </div>
  );
});

export default Base;
