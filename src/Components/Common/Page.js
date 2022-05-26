import { ThemeProvider, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { homeTheme } from '../Home/theme';
import pageStyles from './pageStyles';
import Footer from '../Home/Footer';
import Section, { FullWidthContainer } from './Section';

const Page = (props) => {
  let { classes, heroContent, pageTitle, children, bgVariant } = props;
  return (
    <ThemeProvider theme={homeTheme}>
      <div className={classes.pageContainer}>
        <FullWidthContainer bgVariant={bgVariant || 'royal'}>
          <Section>
            {pageTitle && <div className={classes.titleSection}>
              <Typography variant="h1" className={classes.pageTitle}>
                {pageTitle}
              </Typography>
            </div>}
            {heroContent}
          </Section>
        </FullWidthContainer>
        {children}
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default withStyles(pageStyles)(Page);
