import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';

import { withRouter } from "react-router";

import { Home, CollectionsBookmark, AccountCircle, InsertChartOutlined, ChevronLeft } from '@material-ui/icons';

import { withStyles } from '@material-ui/core/styles';

const navDrawerWidth = 150;

const styles = theme => ({
  drawer: {
    width: navDrawerWidth,
    flexShrink: 0,
  },

  drawerPaper: {
    width: navDrawerWidth,
  },

  drForm: {
      width: 180,
      boxShadow: '0px 0px 0px 2px rgba(0,0,0,0.2)'
  },

  drFormPaper: {
      width: 180,
      left: navDrawerWidth,
      boxShadow: '0px 0px 0px 2px rgba(0,0,0,0.2)'
    //   boxShadow: theme.sha
  },

  drFormHead: {
    alignItems: 'center',
  },

  nestedListItem: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0,
      marginTop: '-10px',
  },

  logo: {
    margin: '10px auto 20px auto',
    width: 60,
    height: 60,
  },

  moveRight: {
      position: 'relative',
      left: '160px'
  }
});

const primaryTypographyProps = {
    variant: 'subtitle2'
}

const nestedPrimaryTypographyProps = {
    variant: 'caption'
}

class PermanentDrawerLeft extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            showDataRetrievalForm: false
        }
    }

    handleOpenDRForm = () => {
        this.setState({...this.state, showDataRetrievalForm: true})
    }

    handleCloseDRForm = () => {
        this.setState({...this.state, showDataRetrievalForm: false})
    }

    render() {
        const { classes } = this.props;
        const { pathname } = this.props.location;

        return (
            <div>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="left"
                >
                    <List>
                        <ListItem button>
                            <ListItemIcon><Home/></ListItemIcon>
                            <ListItemText primary='Home' primaryTypographyProps={primaryTypographyProps}/>
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon><AccountCircle/></ListItemIcon>
                            <ListItemText primary='Account' primaryTypographyProps={primaryTypographyProps}/>
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon><CollectionsBookmark/></ListItemIcon>
                            <ListItemText primary='Catalog' primaryTypographyProps={primaryTypographyProps}/>
                        </ListItem>

                        <ListItem button>
                            <ListItemIcon><InsertChartOutlined/></ListItemIcon>
                            <ListItemText primary='Visualization' primaryTypographyProps={primaryTypographyProps}/>
                        </ListItem>

                        <Collapse 
                            in={pathname==='/visualization'}
                            timeout="auto" 
                            unmountOnExit
                        >
                            <List component="div" disablePadding dense>
                                <ListItem 
                                    button 
                                    className={classes.nestedListItem}
                                    onClick={this.handleOpenDRForm}
                                >
                                    <ListItemText inset primary="New" primaryTypographyProps={nestedPrimaryTypographyProps}/>
                                </ListItem>
                            </List>

                            <List component="div" disablePadding>
                                <ListItem button className={classes.nestedListItem}>
                                    <ListItemText inset primary="Charts" primaryTypographyProps={nestedPrimaryTypographyProps}/>
                                </ListItem>
                            </List>
                        </Collapse>
                    </List>
                </Drawer>

                <Drawer
                    className={classes.drForm}
                    open={this.state.showDataRetrievalForm}
                    variant="persistent"
                    classes={{
                        paper: classes.drFormPaper,
                    }}
                    anchor="left"
                >             

                    <div className={classes.drFormHead}>
                        <IconButton onClick={this.handleCloseDRForm}>
                            <ChevronLeft color='action'/>
                        </IconButton>
                    </div>     
                </Drawer>

            </div>
        );
    }
}

export default withRouter(withStyles(styles)(PermanentDrawerLeft));

// import { makeStyles, useTheme } from '@material-ui/core/styles';
// import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

// const useStyles = makeStyles(theme => ({
//   root: {
//     display: 'flex',
//   },
//   appBar: {
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//   },
//   appBarShift: {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   hide: {
//     display: 'none',
//   },
//   drawer: {
//     width: drawerWidth,
//     flexShrink: 0,
//   },
//   drawerPaper: {
//     width: drawerWidth,
//   },
//   drawerHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     padding: theme.spacing(0, 1),
//     ...theme.mixins.toolbar,
//     justifyContent: 'flex-end',
//   },
//   content: {
//     flexGrow: 1,
//     padding: theme.spacing(3),
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//     marginLeft: -drawerWidth,
//   },
//   contentShift: {
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//     marginLeft: 0,
//   },
// }));

// export default function PersistentDrawerLeft() {
//   const classes = useStyles();
//   const theme = useTheme();
//   const [open, setOpen] = React.useState(false);

//   const handleDrawerOpen = () => {
//     setOpen(true);
//   };

//   const handleDrawerClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className={classes.root}>
//       <Drawer
//         className={classes.drawer}
//         variant="persistent"
//         anchor="left"
//         open={open}
//         classes={{
//           paper: classes.drawerPaper,
//         }}
//       >
//         <div className={classes.drawerHeader}>
//           <IconButton onClick={handleDrawerClose}>
//             {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//           </IconButton>
//         </div>
//         <Divider />
//         <List>
//           {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//             <ListItem button key={text}>
//               <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItem>
//           ))}
//         </List>
//         <Divider />
//         <List>
//           {['All mail', 'Trash', 'Spam'].map((text, index) => (
//             <ListItem button key={text}>
//               <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItem>
//           ))}
//         </List>
//       </Drawer>
//     </div>
//   );
// }