import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { RxDotFilled } from "react-icons/rx";
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';

const Content = (props) => {
  const cl = sectionStyles();

  return (
    <div className={cl.container}>
      <Typography>
        Data submitted to{' '}
        <span style={{ fontWeight: 600 }}>
          Simons Collaborative Marine Atlas Project
        </span>{' '}
        must be precisely formatted to maintain high levels of{' '}
        <em>discoverability</em>, <em>comparability</em>, and{' '}
        <em>database performance</em>.
      </Typography>

      <Typography style={{ marginTop: '16px' }}>
        The purpose of this guide is to support data submitters in:
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Preparing the dataset for inclusion in Simons CMAP
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Ensuring that the dataset is discoverable via CMAP search
            capabilities and infrastructure
          </ListItemText>
        </ListItem>

        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Ensuring that the dataset contains the information that users
            require to understand the dataset
          </ListItemText>
        </ListItem>
      </List>

      <div className={cl.subHeader}>
        Submission Tool tutorial:
      </div>
      <div className={cl.standoutBox} style={{ width: '780px', background: 'black' }}>
        <iframe
          src="https://player.vimeo.com/video/981629505"
          width="780"
          height="440"
          style={{ margin: '0 auto', border: '0' }}
        ></iframe>
      </div>


    </div>
  );
};

export default Content;
