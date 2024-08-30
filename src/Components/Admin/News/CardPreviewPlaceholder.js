import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles ((theme) => ({
  placeholder: {
    height: '200px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
  }
}));

const Placeholder = (props) => {
  const cl = useStyles ();
  return (
    <div className={cl.placeholder}>
      <span>No Preview - Add Content</span>
    </div>
  );
}

export default Placeholder;
