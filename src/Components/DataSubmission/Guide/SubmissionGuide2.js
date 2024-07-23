import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useHistory} from 'react-router-dom';
import queryString from 'query-string';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';

import Page2 from '../../Common/Page2';
import NavigationTree from './Tree';
import { findById, getImportNameById, findNext, findPrev } from './tableOfContents';
import * as GuideSections from './Sections/index';
import useStyles, { sectionStyles } from './guideStyles';
import StepButton from './NavButton';
import { dataSubmissionSelectOptionsFetch } from '../../../Redux/actions/dataSubmission';


function scrollToFocus (name) {
  const scrollContainer = document.getElementById ('content-scroll-container');
  const query = `[data-focus="${name}"]`;
  const el = scrollContainer.querySelector (query);
  if (el) {
    console.log ('scrollToFocus', name, el.offsetTop, el)
    const offset = el.offsetTop;
    scrollContainer.scrollTo (0, offset);
  }
}

const Programs = () => {
  const cl = useStyles();
  const scl = sectionStyles();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory ();

  const ref = useRef();

  useEffect (() => {
    // fetch submission options once
    dispatch (dataSubmissionSelectOptionsFetch ());
  }, []);

  let [content, setContent] = useState('getting-started');
  let [focusTarget, setFocus] = useState();

  const setContentWithLocation = (currentId, clearFocus) => {
    console.log ('setContentWithLocation', { currentId, clearFocus })
    history.push (
      location.pathname
        + (clearFocus ? '' : location.search)
        + (currentId ? `#${currentId}` : '')
    );
    setContent (currentId);
    if (clearFocus) {
      const scrollContainer = document.getElementById ('content-scroll-container');
        if (scrollContainer) {
          scrollContainer.scrollTo (0, 0);
        }
      setFocus (undefined);
    }
  };

  const manualSetFocus = (id, preventScrollReset) => {
    console.log ('manualSetFocus', id)

    if (!id) {
      history.push (location.pathname + location.hash)
      setFocus (undefined);
      if (!preventScrollReset) {
        const scrollContainer = document.getElementById ('content-scroll-container');
        if (scrollContainer) {
          scrollContainer.scrollTo (0, 0);
        }
      }
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
    if (qs && qs.focus && qs.focus !== focusTarget) {
      console.log ('location hook: scroll to focus', qs.focus)
      // when focus has been set by a locuation update that was not triggered by manualSetFocus,
      // then go ahead and scroll to the focus area
      const scrollContainer = document.getElementById ('content-scroll-container');
      if (scrollContainer) {
        setTimeout(scrollToFocus, 2, qs.focus);
      }
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
              <div className={cl.selectedContent} id={'content-scroll-container'}>
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
