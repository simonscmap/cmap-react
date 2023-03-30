import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, Link, withStyles } from '@material-ui/core';
import { cellStyles } from './gridStyles';
import { colors } from '../../Home/theme';

// Context for sharing Variable Unstructured Metadata Selection
// Comment Cell Render Component
// TODO replace this with sidebar tool
const CommentCellRenderer = withStyles(cellStyles)((props) => {
  const { value, classes } = props;

  const [open, setOpen] = React.useState(false);

  return !props.value || (props.value && props.value.length) < 20 ? (
    props.value
  ) : (
    <React.Fragment>
      <Link
        component="button"
        style={{ color: colors.primary, fontSize: '12px', lineHeight: '38px' }}
        onClick={() => setOpen(true)}
      >
        View Comment
      </Link>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{ paper: classes.dialogPaper }}
      >
        <ReactMarkdown source={value} className={classes.markdown} />
      </Dialog>
    </React.Fragment>
  );
});

export default CommentCellRenderer;
