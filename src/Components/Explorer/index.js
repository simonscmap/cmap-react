import React from 'react';
import { homeTheme, colors } from '../Home/theme';
import { ThemeProvider } from '@material-ui/core';
import useStyles from './styles';

const TestComponent = () => {
  const cl = useStyles();

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={cl.mainWrapper}>
        <div className={cl.alignmentWrapper}>
          <h1>Test Component</h1>
          <div className={cl.resizeable}>
            <iframe src="/item" height="700px" className={cl.iframe}></iframe>
          </div>
    </div>
      </div>
    </ThemeProvider>
  );
}

export default TestComponent;

export const testPageConfig = {
  route: '/test',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
