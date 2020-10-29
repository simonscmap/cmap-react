import React from 'react';
import { withStyles } from '@material-ui/core';
import { ZoomOutMap } from '@material-ui/icons';

import colors from '../../Enums/colors';

const styles = (theme) => ({
    icon: {
        padding: '12px 12px 12px 0',
        color: colors.primary,
        verticalAlign: 'middle'
    }
});

const DragIcon = (props) => {

    return (
        <React.Fragment>
            <ZoomOutMap id={props.iconID} className={props.classes.icon}/>
        </React.Fragment>
    )
}

export default withStyles(styles)(DragIcon);