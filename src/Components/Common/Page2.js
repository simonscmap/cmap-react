// An updated, generic Page component
// - 100% height
// - Standard Footer
// - Full Width Container with gradient background
// - Page Title
import React from 'react';
import clsx from 'clsx';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { homeTheme, colors } from '../Home/theme';
import Footer from '../Home/Footer';

/* ~~~~~~~~~~~ Full Width Container ~~~~~~~~~~~~~*/

const useContainerStyles = makeStyles ((theme) => ({
  fullWidthContainer: {
    width: '100%',
    textAlign: 'left',
    margin: 0,
    padding: 0,
  },
  deeps: {
    background: colors.gradient.deeps,
  },
  royal: {
    background: colors.gradient.royal,
  },
  slate: { // default
    background: colors.gradient.slate,
  },
  slate2: {
    background: colors.gradient.slate2,
  },
  purple: {
    background: colors.gradient.newsBlock,
  },
}));


export const FullWidthContainer = (props) => {
  const { bgVariant, children, minWidth } = props;
  const cl = useContainerStyles ();
  return (
    <div
      className={clsx(
        cl.fullWidthContainer,
        bgVariant ? cl[bgVariant] : cl.slate,
      )}
      style={{ minWidth: minWidth }}
    >
      {children}
    </div>
  );
}



/* ~~~~~~~~~~~ Page ~~~~~~~~~~~~~*/

const usePageStyles = makeStyles ((theme) => ({
  pageContainer: {
    // use a stacked grid layout to ensure that the child FillWidthContainer
    // and the footer take up at least 100% of vertical space
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr auto',
    gridGap: 0,
    minHeight: '100vh',
    width: '100%',
    '& > div': {
      paddingTop: '100px',
    },
    color: '#ffffff',
    '& p a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        color: theme.palette.primary.light,
        textDecoration: 'none',
      },
    },

  },

}));

const Page2 = (props) => {
  const { children, bgVariant } = props;
  const cl = usePageStyles ();
  return (
      <div className={cl.pageContainer}>
        <FullWidthContainer bgVariant={bgVariant || 'royal'}>
          {children}
        </FullWidthContainer>
        <Footer />
      </div>
  );
};

export default Page2;
