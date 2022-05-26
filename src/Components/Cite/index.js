import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Page from '../Common/Page';
import Block from '../Common/Block';

const styles = () => ({
  sectionGap: {
    marginBottom: '1.5em',
  },
  tallLines: {
    lineHeight: '1.9em',
  },
  large: {
    fontSize: '1.4rem',
  },
});

const HeroContent = withStyles(styles)(({ classes }) => (
  <div>
    <Typography variant="subtitle1" className={classes.sectionGap}>
      To cite use of Simons CMAP please reference this 2021 manuscript that
      describes Simons CMAP:
    </Typography>
    <Block>
      <code className={classes.large}>
        Ashkezari, M.D., Hagen, N.R., Denholtz, M., Neang, A., Burns, T.C.,
        Morales, R.L., Lee, C.P., Hill, C.N. and Armbrust, E.V. (2021), Simons
        Collaborative Marine Atlas Project (Simons CMAP): An open-source portal
        to share, visualize, and analyze ocean data. Limnol Oceanogr Methods,
        19: 488-496. https://doi.org/10.1002/lom3.10439
      </code>
    </Block>
  </div>
));

const Cite = () => {
  return (
    <Page
      pageTitle={'How to Cite Simons CMAP'}
      heroContent={<HeroContent />}
    ></Page>
  );
};

export default withStyles(styles)(Cite);

export const citeConfig = {
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Center',
};
