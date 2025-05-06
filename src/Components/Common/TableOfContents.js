import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Section from './Section';

const tocStyles = () => ({});

const Item = ({ text, custom, bookmark, href }) => {
  // basic use is a text and a bookmark are provided
  // but an external href will override the bookmark,
  // and custom component will override the Link
  let target = href ? href : bookmark ? `#${bookmark}` : '#';
  let content = text ? <Link href={target}>{text}</Link> : custom ? custom : '';
  return (
    <ListItem>
      <ListItemText>{content}</ListItemText>
    </ListItem>
  );
};

export const ToCBase = withStyles(tocStyles)((props) => {
  let { title, links } = props;
  return (
    <div>
      {title && <Typography variant="h3">{title}</Typography>}
      <List>
        {links.map((itemProps, i) => (
          <Item key={`toc-item-${i}`} {...itemProps} />
        ))}
      </List>
    </div>
  );
});

// TableOfContents is a simple flat list of items
// which link to bookmarks
const TableOfContents = (props) => {
  let { pageName } = props;
  return (
    <Section name={`${pageName}-toc`}>
      <ToCBase {...props} />
    </Section>
  );
};

export default TableOfContents;
