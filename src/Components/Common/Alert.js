import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { LuAlertTriangle } from 'react-icons/lu';

const yellowAlert = 'rgb(255, 227, 54)';

const useWarningStyles = makeStyles((theme) => ({
  warning: {
    color: 'white',
    border: `1px solid ${yellowAlert}`,
    borderRadius: '6px',
    background: 'rgba(20,20,20,0.3)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    flexDirection: 'row',
    gap: '0',
    flexWrap: 'nowrap',
  },
  iconContainer: {
    color: yellowAlert,
    width: '40px',
    fontSize: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    textAlign: 'left',
    fontFamily: '"Lato",sans-serif',
    fontSize: '14px',
    padding: '6px 3px',
  },
}));

export const Warning = (props) => {
  const cl = useWarningStyles();
  return (
    <div className={cl.warning}>
      <div className={cl.iconContainer}>
        <LuAlertTriangle />
      </div>
      <div className={cl.textContainer}>{props.children}</div>
    </div>
  );
};
