import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import GetAppIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles((theme) => ({
  linkWithIcon: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& svg': {
      fontSize: '1em',
      paddingLeft: '2px',
    },
  },
  container: {
    display: 'inline-block',
  },
}));

// wrapper for links in the submission guide
// adds section § mark to internal links
// adds mail, download, and external icons appropriate links

export const GuideLink = (props) => {
  const { href, hash, download, children } = props;
  const cl = useStyles();

  if (href) {
    if (href.slice(0, 7) === 'mailto:') {
      // detect mailto
      return (
        <span className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            {children}
            <MailOutlineIcon />
          </Link>
        </span>
      );
    } else if (href.slice(0, 1) === '#') {
      // detect a bookmark
      return (
        <span className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            § {children}
          </Link>
        </span>
      );
    } else if (download) {
      // detect download
      return (
        <span className={cl.container}>
          <Link href={href} className={cl.linkWithIcon}>
            {children}
            <GetAppIcon />
          </Link>
        </span>
      );
    } else {
      return (
        <span className={cl.container}>
          <Link href={href} className={cl.linkWithIcon} target="_blank">
            {children}
            <OpenInNewIcon />
          </Link>
        </span>
      );
    }
  } else if (hash) {
    return (
      <span className={cl.container}>
        <Link href={hash} className={cl.linkWithIcon}>
          § {children}
        </Link>
      </span>
    );
  } else {
    return { children };
  }
};
