import React, { useState } from 'react';
import newsBannerStyles from './newsBannerStyles';
import { withStyles } from '@material-ui/core/styles';
import { WhiteButtonSM } from './buttons';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import parse from 'html-react-parser';

// look at a link's protocol to determine whether it is an internal link
// or an external link
// this will determine whether to use a Link component or an `a` tag
export const isSPALink = (link) => {
  if (typeof link !== 'string') {
    return false;
  } else if (link.slice(0, 4) === 'http') {
    return false;
  } else if (link.slice(0, 1) === '/') {
    return true;
  } else {
    // console.log('unknown link type', link, link.slice(0,3), link.slice(0,1));
    return false;
  }
};

const toA = ([text, href, i]) => (
  <a key={i} target="_blank" rel="noreferrer" href={href} data-type="anchor">
    {text}
  </a>
);

export const renderText = (text) => {
  let result = '';
  let encodingContext = { em: 0, i: 0, u: 0 };
  for (let i = 0; i < text.length; i++) {
    switch (text.charAt(i)) {
      case '*':
        if (encodingContext.em === 0) {
          result += '<em>';
          encodingContext.em = 1;
        } else {
          result += '</em>';
          encodingContext.em = 0;
        }
        break;

      case '/':
        if (encodingContext.i === 0) {
          result += '<i>';
          encodingContext.i = 1;
        } else {
          result += '</i>';
          encodingContext.i = 0;
        }
        break;
      case '_':
        if (encodingContext.u === 0) {
          result += '<u>';
          encodingContext.u = 1;
        } else {
          result += '</u>';
          encodingContext.u = 0;
        }
        break;
      default:
        result += text.charAt(i);
    }
  }

  let parsedText;
  try {
    parsedText = parse(result);
  } catch (e) {
    console.log('error parsing story headline', e);
    // fallback to string representation of headline
    parsedText = text;
  }
  return parsedText;
};

export const renderHeadline = (headline, link) => {
  let parsedText = renderText(headline);
  if (isSPALink(link)) {
    return (
      <Typography variant="h4">
        <Link to={link} data-type="link">
          {parsedText}
        </Link>
      </Typography>
    );
  } else {
    return <Typography variant="h4">{toA([parsedText, link, 0])}</Typography>;
  }
};

// intercalate jsx links/a into body text
export const renderBody = (body) => {
  let links = [];
  if (body && body.links && Array.isArray(body.links)) {
    links = body.links.map(({ text, url }, i) => {
      if (isSPALink(url)) {
        return (
          <Link key={i} to={url} data-type="link">
            {text}
          </Link>
        );
      } else {
        return toA([text, url, i]);
      }
    });
  }
  let bodyText = [];
  if (body && body.content && typeof body.content === 'string') {
    bodyText = body.content.split(/\{\d\}/).map(renderText);
  }
  let content = [];
  for (let i = 0; i < bodyText.length; i++) {
    let span = <span key={`span:${i}`}>{bodyText[i]}</span>;
    content.push(span);
    if (links[i]) {
      content.push(links[i]);
    }
  }
  return content;
};

export const Card = withStyles(newsBannerStyles)(
  ({ classes, story, position, style }) => {
    let { date, headline, link, body } = story;

    // position is index - flowPointer
    let styleKey =
      position > 3
        ? 'cardTail'
        : position === 3
        ? 'cardThird'
        : position === 2
        ? 'cardSecond'
        : position >= 0
        ? ''
        : position === -1
        ? 'cardFaded'
        : 'cardShadow';

    return (
      <div
        className={clsx(
          classes.newsCard,
          classes.newsCardContent,
          classes[styleKey],
        )}
        style={style}
      >
        <div>
          <Typography variant="body2" className={classes.newsBlockDate}>
            {date}
          </Typography>
          {renderHeadline(headline, link)}
        </div>
        <Typography variant="body1">{renderBody(body)}</Typography>
      </div>
    );
  },
);

const NewsStories = withStyles(newsBannerStyles)(
  ({ classes, isExpanded, stories, flowPointer }) => {
    let lede = stories.length ? stories[0] : {};

    let marginOffset = (idx) => {
      return idx === 0 ? `-${flowPointer * 365}px` : '';
    };

    if (isExpanded) {
      return (
        <div className={classes.newsFlow}>
          {stories.map((story, idx) => (
            <Card
              key={`news-story-${idx}`}
              story={story}
              position={idx - flowPointer}
              style={{ marginLeft: marginOffset(idx) }}
            />
          ))}
        </div>
      );
    } else {
      return (
        <Typography variant="body1" className={classes.newsBannerLink}>
          {isSPALink(lede.link) ? (
            <Link to={lede.link}>{lede.headline}</Link>
          ) : (
            toA([lede.headline, lede.link])
          )}
        </Typography>
      );
    }
  },
);

const Controls = withStyles(newsBannerStyles)(
  ({ classes, isExpanded, toggle, scroll }) => {
    const { scrollRight, scrollLeft } = scroll;

    if (isExpanded) {
      return (
        <div className={classes.blockControls}>
          <div className={classes.scrollControlsContainer}>
            <div className={classes.arrowButtonContainer} onClick={scrollLeft}>
              <img
                src="/images/home/arrow-button.svg"
                style={{ transform: 'rotate(180deg)' }}
              />
            </div>
            <div className={classes.arrowButtonContainer} onClick={scrollRight}>
              <img src="/images/home/arrow-button.svg" />
            </div>
          </div>
          <div className={classes.collapseContainer}>
            <div className={classes.arrowButtonContainer} onClick={toggle}>
              <img
                src="/images/home/arrow-button.svg"
                style={{ transform: 'rotate(-90deg)' }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <WhiteButtonSM onClick={toggle} className={classes.bannerExpandButton}>
          View All Announcements
        </WhiteButtonSM>
      );
    }
  },
);

const NewsBanner = (props) => {
  let { classes, stories } = props;

  // track which story is in first position
  const [flowPointer, setFlowPointer] = useState(0);

  const scrollRight = () => {
    if (flowPointer >= stories.length - 1) {
      // no op
    } else {
      setFlowPointer(flowPointer + 1);
    }
  };

  const scrollLeft = () => {
    if (flowPointer <= 0) {
      // no op
    } else {
      setFlowPointer(flowPointer - 1);
    }
  };

  let [isExpanded, setExpanded] = useState(false);
  let toggleNews = () => {
    setFlowPointer(0); // reset
    setExpanded(!isExpanded);
  };

  // Note: Link must have color="inherit" to receive color from Typography
  return (
    <div className={isExpanded ? classes.newsBlock : classes.newsBanner}>
      <div
        className={clsx(
          classes.newsInnerContainer,
          isExpanded
            ? classes.newsBlockInnerContainer
            : classes.newsBannerInnerContainer,
        )}
      >
        <NewsStories
          stories={stories}
          flowPointer={flowPointer}
          isExpanded={isExpanded}
        />
        <Controls
          isExpanded={isExpanded}
          toggle={toggleNews}
          scroll={{ scrollRight, scrollLeft }}
        />
      </div>
    </div>
  );
};

export default withStyles(newsBannerStyles)(NewsBanner);
