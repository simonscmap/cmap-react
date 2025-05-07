import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

/* ~~~~~~~~~~~ Title ~~~~~~~~~~~~~*/

const useTitleStyles = makeStyles((theme) => ({
  container: {},
  title: {
    color: '#fff',
    fontSize: '1.6rem',
    fontWeight: '100',
  },
}));

const Title = (props) => {
  const { text } = props;
  const cl = useTitleStyles();
  if (!text) {
    return '';
  }
  return (
    <div className={cl.container}>
      <h2 className={cl.title}>{text}</h2>
    </div>
  );
};

export default Title;
