import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import featureGridStyles from './featureGridStyles';
import clsx from 'clsx';
import SearchBox from './SearchBox';

// look up style via the seaction id
// exception: id === findData (then render a search box)
const Art = withStyles(featureGridStyles)(({ classes, id }) => {
  let containerClasses =
    id === 'findData'
      ? clsx(classes.sectionArtFlexContainer, classes.sectionArtFindDataSpacing)
      : classes.sectionArtFlexContainer;
  return (
    <div className={containerClasses}>
      <div className={clsx(classes[`sectionArt_${id}`], classes.sectionArt)}>
        {id === 'findData' && <SearchBox />}
      </div>
    </div>
  );
});

const Copy = withStyles(featureGridStyles)(
  ({ classes, title, text, buttons }) => (
    <div className={classes.sectionTextContainer}>
      <Typography
        variant="h3"
        className={clsx(classes.h3adjust, classes.textAlignLeft)}
      >
        {title}
      </Typography>
      <Typography variant="h5" className={classes.textAlignLeft}>
        {text}
      </Typography>
      <div className={classes.buttonsContainer}>{buttons}</div>
    </div>
  ),
);

const Section = (props) => {
  let { classes, sectionProps, children } = props;
  let { id, variant, title, text } = sectionProps;

  let sectionContent = [
    <Art id={id} key={'fst'} />,
    <Copy title={title} text={text} buttons={children} key={'snd'} />,
  ];

  return (
    <div className={classes.gridSectionOuterContainer}>
      {id !== 'findData' ? <hr className={classes.gridHR} /> : ''}
      <div className={classes.gridSectionInnerContainer}>
        {variant === 'left' ? sectionContent : sectionContent.reverse()}
      </div>
    </div>
  );
};

export default withStyles(featureGridStyles)(Section);
