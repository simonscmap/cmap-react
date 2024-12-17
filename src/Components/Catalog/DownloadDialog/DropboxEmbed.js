import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { safePath } from '../../../Utility/objectUtils';
import { dropboxModalClose } from '../../../Redux/actions/catalog';

const useStyles = makeStyles((theme) => ({
  embedHeight: {
    height: '100%',
  },
}));

const DropboxEmbed = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const shareLink = useSelector ((state) =>
    safePath (['download', 'vaultLink', 'shareLink']) (state));

  const dropboxModalOpen = useSelector((state) => state.download.dropboxModalOpen);


  const ref = useRef (null);

  const [dbxEmbed, setDbxEmbed] = useState();

  const visibility = shareLink ? {} : { visibility: 'hidden', height: 0 };


  /* the mounting/unmounting logic depends on the following redux state behavior:
     when a vault link is fetched and exists, it should be mounted;
     when a new link is fetched, the old link is nulled out
   */
  useEffect(() => {
    if (ref.current) {
      if (shareLink) {
        console.log ('shareLink', shareLink);
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
          console.log ("UNMOUNT no shareLink");
          window.Dropbox.unmount (dbxEmbed);
          setDbxEmbed(null);
        } catch (e) {
          console.log ('there was an error unmounting the dropbox embed');
        }
      } else {
        console.log ('no share link and no existing embed');
      }
    } else {
      console.log ("dbx embed: no ref")
    }

    return () => {
      if (dbxEmbed) {
        console.log ("UNMOUNT unmount")
        window.Dropbox.unmount(dbxEmbed);
        setDbxEmbed(null);
      } else {
        console.log ("no embed to unmount");
      }
    }
  }, [shareLink]);

  useEffect (() => {
    if (dropboxModalOpen === 'cleanup') {
      if (dbxEmbed) {
        console.log ('cleanup: unmount embed');
        window.Dropbox.unmount(dbxEmbed);
      } else {
        console.log ('cleanup: no embed to unmount');
      }
      setDbxEmbed(null);
      dispatch (dropboxModalClose ()); // now that we have unmounted dbx, close the modal
    }
  }, [dropboxModalOpen])

  return <div ref={ref} style={visibility} className={classes.embedHeight} />;
};




export default DropboxEmbed;
