import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions, Grid } from '@material-ui/core';

import Draggable from 'react-draggable';

const styles = theme => ({
    landingWrapper: {
        margin: '15vh auto'
    },

    accordion: {
        width: '30%'
    },

    gridSection: {
        border: '1px solid pink',
        width: '50%',
        minHeight: '200px'
    },

    parent: {
        height: '80vh',
        width: '80vw',
        margin: '10vh 10vw',
        border: '1px solid green'
    }
})



let items = {
    'item-1': {
        id: 'item-1',
        order: 0,
    }
}

// type item = {
    // bounds ??
    // contents
    // order
    // id
    // defaultPosition
// }

// const DraggableMenuItem = (props) => {
//     const handleStop = (e) => {

//     }
    
//     return (
//         <Draggable grid={[25, 25]} defaultPosition={props.defaultPosition || null}>
//             <Accordion className={classes.accordion}>
//                 <AccordionSummary>
//                     {props.title}
//                 </AccordionSummary>
//                 <AccordionDetails>
//                     {props.contents}
//                 </AccordionDetails>
//             </Accordion>
//         </Draggable>
//     )
// }

class LandingPage extends Component {

    state = {
        panelItems: [0, 1, 2],
        draggedItems: []
    }

    handleDrop = (event) => {
        console.log(event.target);
    }

    render(){
        const { classes } = this.props;

        return (
            <div className={classes.parent}>
                <div className={classes.gridSection}>
                            {/* <Accordion draggable={true}  className={classes.accordion}>
                                <AccordionSummary>
                                    I'm an accordion summary.
                                </AccordionSummary>
                                <AccordionDetails>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                </AccordionDetails>
                            </Accordion>

                            <Accordion draggable={true} className={classes.accordion}>
                                <AccordionSummary>
                                    I'm an accordion summary 2.
                                </AccordionSummary>
                                <AccordionDetails>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                </AccordionDetails>
                            </Accordion>

                            <Accordion draggable={true} className={classes.accordion}>
                                <AccordionSummary>
                                    I'm an accordion summary 3.
                                </AccordionSummary>
                                <AccordionDetails>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                </AccordionDetails>
                            </Accordion> */}

                            <Draggable>
                                <Accordion className={classes.accordion}>
                                    <AccordionSummary>
                                        I'm an accordion summary 1.
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                    </AccordionDetails>
                                </Accordion>
                            </Draggable>

                            <Draggable>
                                <Accordion className={classes.accordion}>
                                    <AccordionSummary>
                                        I'm an accordion summary 1.
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                    </AccordionDetails>
                                </Accordion>
                            </Draggable>

                            <Draggable onStop={(e) => {
                                    console.log(e);
                                    e.stopPropagation();
                                }}>
                                <Accordion className={classes.accordion}>
                                    <AccordionSummary>
                                        I'm an accordion summary 1.
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis risus sit amet ipsum vestibulum tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt dolor in porta interdum.
                                    </AccordionDetails>
                                </Accordion>                                
                            </Draggable>
                    </div>
            </div>
        )
    }
}

export default withStyles(styles)(LandingPage);