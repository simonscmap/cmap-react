import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Typography } from '@material-ui/core';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({

});

const CartHelpContents = (props) => {

    return (
            <React.Fragment>
                <Typography>
                    Adding datasets to your cart allows quick and easy access without returning to the catalog. Additionally, datasets in your cart will appear
                    first when searching on the visualization page, and will be marked with a cart icon as below.
                </Typography>

                <img 
                    src='/images/help_cart_marked_in_search.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Dataset With Cart Icon Example'
                />

                <Typography>
                    Some datasets do not contain any variables intended for visualization. These can be identified by a yellow icon on the catalog page
                    or in the cart, and can be added to your cart for easier access, but won't appear on the visualization page.
                </Typography>

                <img 
                    src='/images/help_cart_warning_icon.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Dataset With A Warning Icon'
                />

                <img 
                    src='/images/help_cart_yellow_cart_Icon.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Dataset With Yellow Cart Icon'
                />

                <Typography>
                    Items will remain in your cart on subsequent visits as long as you are logged in.
                </Typography>
            </React.Fragment>
        )
    }

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CartHelpContents));