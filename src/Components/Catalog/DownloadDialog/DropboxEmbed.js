import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { safePath } from '../../../Utility/objectUtils';

const useStyles = makeStyles((theme) => ({
  height: {
    height: '100%',
  },
}));

const DropboxEmbed = () => {
  const classes = useStyles();
  const shareLink = useSelector ((state) =>
    safePath (['download', 'vaultLink', 'shareLink']) (state));

  const [dbxEmbed, setDbxEmbed] = useState();
  const [ref, setRef] = useState(useRef(null))
  const visibility = dbxEmbed ? {} : { visibility: 'none' };



  /* the mounting/unmounting logic depends on the following redux state behavior:
     when a vault link is fetched and exists, it should be mounted;
     when a new link is fetched, the old link is nulled out
   */
  useEffect(() => {
    if (ref.current) {
      if (shareLink) {
        let embed;
        try {
          console.log ("MOUNT");
          embed = window.Dropbox.embed({ link: shareLink }, ref.current);
        } catch (e) {
          console.log ('there was an error mounting the dropbox embed', e);
        }
        setDbxEmbed (embed);
      } else if (dbxEmbed) {
        try {
          console.log ("UNMOUNT");
          window.Dropbox.unmount (dbxEmbed);
setDbxEmbed(null);
    setRef (useRef(null));
        } catch (e) {
          console.log ('there was an error unmounting the dropbox embed');
        }
      } else {
        console.log ('no share link and no existing embed');
      }
    }
    return () => {
      console.log ("UNMOUNT unmount")
      dbxEmbed && window.Dropbox.unmount(dbxEmbed)
setDbxEmbed(null);
    setRef (useRef(null));
    }
  }, [shareLink]);

  return <div ref={ref} stlye={visibility} className={classes.height} />;
};




export default DropboxEmbed;
