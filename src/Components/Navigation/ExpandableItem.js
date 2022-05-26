import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import clsx from 'clsx';
import React from 'react';
import navigationStyles from './navigationStyles';
import { useLocation } from 'react-router-dom';

const ExpandableItem = withStyles(navigationStyles)((props) => {
  let { classes, children, linkText, isRightEdge } = props;
  const [isOpen, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!isOpen);
  };
  const handleClose = () => setOpen(false);

  let location = useLocation();
  React.useEffect(() => {
    handleClose();
  }, [location])

  return (
    <div className={classes.expandableItemContainer}>
      <ClickAwayListener onClickAway={handleClose}>
        <div>
          <div className={classes.expandableItem} onClick={handleClick}>
            <span>{linkText}</span>
            <span
              className={
                isOpen
                  ? classes.expandableChevronOpen
                  : classes.expandableChevronClose
              }
            >
              <KeyboardArrowUpIcon />
            </span>
          </div>
          <div
            className={clsx(
              classes.effectContainer,
              isRightEdge ? classes.effectContainerRightEdge : {},
            )}
          >
            <Collapse in={isOpen}>
              <div className={classes.expandableItemChildren}>{children}</div>
            </Collapse>
          </div>
        </div>
      </ClickAwayListener>
    </div>
  );
});

export default ExpandableItem;
