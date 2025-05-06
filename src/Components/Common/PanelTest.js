import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import Page from '../Common/Page';
import Section, { FullWidthContainer } from '../Common/Section';
import clsx from 'clsx';
import SlideOutPanel from '../Common/SlideOutPanel';
import { GreenButtonSM } from '../Common/Buttons';

const styles = () => ({
  paragraphGap: {
    marginTop: '1em',
  },
  tallLines: {
    lineHeight: '1.9em',
  },
});

const HeroContent = withStyles(styles)(({ classes }) => {
  return (
    <div>
      <Typography variant="subtitle1" className={classes.noTopMargin}>
        Using Simons CMAP to compare sea surface temperature data from different
        ocean observing methods
      </Typography>
    </div>
  );
});

const Test = ({ classes }) => {
  let sectionText = clsx(classes.tallLines, classes.paragraphGap);

  let [panelOpen, setPanelOpen] = useState(false);

  let togglePanel = (e) => {
    e.preventDefault();
    console.log('toggle', panelOpen);
    setPanelOpen(!panelOpen);
  };

  let handleClose = () => {
    console.log('handle close', panelOpen);
    setPanelOpen(false);
  };
  return (
    <Page pageTitle={'Test Slide Out Panel'} heroContent={<HeroContent />}>
      <FullWidthContainer bgVariant={'slate'}>
        <Section title="Description">
          <Typography variant="h5" className={sectionText}>
            With a little more deliberation in the choice of their pursuits, all
            men would perhaps become essentially students and observers, for
            certainly their nature and destiny are interesting to all alike. In
            accumulating property for ourselves or our posterity, in founding a
            family or a state, or acquiring fame even, we are mortal; but in
            dealing with truth we are immortal, and need fear no change nor
            accident. The oldest Egyptian or Hindoo philosopher raised a corner
            of the veil from the statue of the divinity; and still the trembling
            robe remains raised, and I gaze upon as fresh a glory as he did,
            since it was I in him that was then so bold, and it is he in me that
            now reviews the vision. No dust has settled on that robe; no time
            has elapsed since that divinity was revealed. That time which we
            really improve, or which is improvable, is neither past, present,
            nor future.
          </Typography>
          <GreenButtonSM onClick={togglePanel}>
            {panelOpen ? 'Close Panel' : 'Open Panel'}
          </GreenButtonSM>
        </Section>
        <SlideOutPanel
          open={panelOpen}
          handleClose={handleClose}
          title="Slide Out Panel Test"
        >
          <Typography>Content</Typography>
        </SlideOutPanel>
      </FullWidthContainer>
    </Page>
  );
};

export default withStyles(styles)(Test);
