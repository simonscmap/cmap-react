import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import GetAppIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles ((theme) => ({
  linkWithIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& svg': {
      fontSize: '1em',
      paddingLeft: '2px'
    }
  },
  container: {
    display: 'inline-block',
  }
}));

// wrapper for links in the submission guide
// adds section § mark to internal links
// adds mail, download, and external icons appropriate links

export const GuideLink = (props) => {
  const { href, hash, download, children } = props;
  const cl = useStyles ();

  if (href) {
    if (href.slice(0, 7) === 'mailto:') { // detect mailto
      return (
        <div className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            { children }
            <MailOutlineIcon />
          </Link>
        </div>);
    } else if (href.slice(0, 1) === '#' ) { // detect a bookmark
      return (
        <div className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            § { children }
          </Link>
        </div>);
    } else if (download) { // detect download
      return (
        <div className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            { children }
            <GetAppIcon />
          </Link>
        </div>);
    } else {
      return (
        <div className={cl.container}>
          <Link href={href} className={cl.linkWithIcon} target="_blank">
            { children }
            <OpenInNewIcon />
          </Link>
        </div>);
    }
  } else if (hash) {
    return (
      <div className={cl.container}>
        <Link href={hash}className={cl.linkWithIcon}>
          § { children }
        </Link>
      </div>);
  } else {
    return {children};
  }
};
