// Not currently in use

import React from 'react';
import { connect } from 'react-redux';
import { withStyles, Button } from '@material-ui/core';
import { Map } from '@material-ui/icons';

import { withRouter } from "react-router";

import { vizPageDataTargetSet } from '../../Redux/actions/visualization';
import { setShowCart } from '../../Redux/actions/ui';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {
    vizPageDataTargetSet,
    setShowCart
}

const styles = (theme) => ({
    button: {
        textTransform: 'none',
        color: theme.palette.primary.main,
        paddingLeft: '4px',
        marginLeft: '14px'
    }
});

const LoadProductOnVizPageButton = (props) => {
    const { product, classes, vizPageDataTargetSet, history, setShowCart } = props;

    const handleButtonClick = () => {
        setShowCart(false);
        vizPageDataTargetSet(product);
        history.push('/visualization');
    }

return (
        <React.Fragment>
            <Button
                    variant="text"
                    color="primary"
                    className={classes.button}
                    startIcon={<Map/>}
                    onClick={handleButtonClick}
                >
                    Load on Visualization Page
            </Button>
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(LoadProductOnVizPageButton)));