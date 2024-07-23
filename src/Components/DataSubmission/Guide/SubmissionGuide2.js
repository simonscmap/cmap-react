import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Page2 from '../../Common/Page2';
import { useLocation, useHistory} from 'react-router-dom';
import queryString from 'query-string';
import NavigationTree from './Tree';
import { findById, getImportNameById, findNext, findPrev } from './tableOfContents';
import * as GuideSections from './Sections/index';
import useStyles, { sectionStyles } from './guideStyles';
import StepButton from './NavButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';

const Programs = () => {
  const cl = useStyles();
  const scl = sectionStyles();
  const location = useLocation();
  const history = useHistory ();

  let [content, setContent] = useState('getting-started');
  let [focusTarget, setFocus] = useState();

  const setContentWithLocation = (currentId, clearFocus) => {
    history.push (
      location.pathname
        + (clearFocus ? '' : location.search)
        + (currentId ? `#${currentId}` : '')
    );
    setContent (currentId);
    if (clearFocus) {
      setFocus (undefined);
    }
  };

  const manualSetFocus = (id) => {
    if (!id) {
      history.push (location.pathname + location.hash)
      setFocus (undefined);
    } else {
      history.push (location.pathname +  `?focus=${id}` + location.hash)
      setFocus (id);
    }
  }

  const match = findById (content);

  useEffect (() => {
    if (!match) {
      return;
    }
    const qs = queryString.parse(location.search);
    if (qs && qs.focus) {
      setFocus (qs.focus);
    }
    const hash = location.hash.slice(1);
    if (!hash) {
      return;
    } else if (hash !== match.current.id) {
      // check if hash exists
      if (findById (hash)) {
        setContent (hash);
      } else {
        history.push (location.pathname)
      }
    }
  }, [location]);

  if (!match) {
    return '';
  }

  const { current } = match;
  const importName = getImportNameById (current.id);
  const CurrentContent = GuideSections[importName];

  const prevTitle = () => {
    const prev = findPrev (current);
    if (prev) {
      return prev.name;
    } else {
      return '';
    }
  }

  const nextTitle = () => {
   const next = findNext (current);
    if (next) {
      return next.name;
    } else {
      return '';
    }
  }


  const goNext = () => {
    const next = findNext (current);
    setContentWithLocation (next.id);
  };

  const goPrev = () => {
    const prev = findPrev (current);
    setContentWithLocation (prev.id);
  };

  return (
    <Page2 bgVariant="slate2">
      <div className={cl.container}>
        <div className={cl.layout}>
          <div className={cl.nav} id={'nav-scroll-container'}>
            <NavigationTree current={current} setContent={setContentWithLocation} />
          </div>
          <div className={cl.content}>
            <Paper className={cl.paper}>
              <p className={scl.header}>{current.name}</p>
              <Divider className={scl.divider}></Divider>
              <div className={cl.selectedContent}>
                {CurrentContent && <CurrentContent
                                     tocId={current.id}
                                     focus={focusTarget}
                                     setFocus={manualSetFocus}
                                   />}
              </div>
              <div className={cl.fwdbckContainer}>
                <Divider className={scl.divider}></Divider>
                <div className={cl.fwdbck}>
                  <div className={cl.bck}>
                    <Typography>{prevTitle ()}</Typography>
                    <StepButton
                      onClick={goPrev}
                      disabled={!findPrev(current)}
                    >
                     <NavigateBeforeIcon />
                    </StepButton>
                  </div>
                  <div className={cl.fwd}>
                    <StepButton
                      onClick={goNext}
                      disabled={!findNext(current)}
                    >
                      <NavigateNextIcon />
                    </StepButton>
                    <Typography>{nextTitle ()}</Typography>
                  </div>
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    </Page2>
  );
};

export default Programs;

export const submissionGuideConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
