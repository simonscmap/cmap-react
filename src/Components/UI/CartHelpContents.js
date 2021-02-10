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
                    Adding datasets to your favorites list allows quick and easy access without returning to the catalog. Additionally, these datasets will appear
                    first when searching on the visualization page, and will be marked with a star icon as below.
                </Typography>

                <img 
                    src='/images/help_cart_marked_in_search.png' 
                    style={{
                        margin: '20px auto',
                        display: 'block',
                        width: '480px',
                        maxWidth: '80vw'
                    }}
                    alt='Dataset With Favorites Icon Example'
                />

                <Typography>
                    Some datasets do not contain any variables intended for visualization. These can be identified by a yellow icon on the catalog page
                    or on the favorites list, and can be added for easy access, but won't appear on the visualization page.
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
                    alt='Dataset With Yellow Star Icon'
                />

                <Typography>
                    Items will remain on your favorites list on subsequent visits as long as you are logged in.
                </Typography>
            </React.Fragment>
        )
    }

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CartHelpContents));