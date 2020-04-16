import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    landingWrapper: {
        margin: '15vh auto'
    }
})

class LandingPage extends Component {

    render(){
        const { classes } = this.props;

        return (
            <div className={classes.landingWrapper}>
                <img 
                    src='/images/large_cmap_logo.png'
                    alt='Simons CMAP Logo'
                    height='290'
                    width='600'
                />
            </div>
        )
    }
}

export default withStyles(styles)(LandingPage);