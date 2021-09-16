// Renders data submission guide items

import React from 'react';

import { withStyles, Typography } from '@material-ui/core';

const styles = (theme) => ({
    sectionHeader: {
        margin: '8px 0',
        fontWeight: 100,
        fontFamily: '"roboto", Serif', 
    },

    anchor: {
        display: 'block',
        position: 'relative',
        top: '-120px',
        visibility: 'hidden'
    },
});

const DSGuideItem = (props) => {
    let { item, classes } = props;
    
    return (
        <React.Fragment>
            <Typography variant='h6' className={classes.sectionHeader} style={{marginTop: '50px'}}>
                {item.label}
                <a className={classes.anchor} id={`data-structure-${item.anchorEnd}`}></a>
            </Typography>
            {item.text.map((text, i) => (
                <Typography key={i}>
                    {text}                           
                </Typography>
            ))}
            <ul>
                {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                ))}
            </ul>
            {item.images.map((image, i) => (
                <figure key={i} style={{margin: '30px 0 0 0'}}>
                    <a className={classes.anchor} id={image.id}></a>
                    <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width || '100%'}                        
                        border='1px'
                        style={{maxwidth: '100%'}}                                            
                    />
                    <figcaption>
                        {image.caption}
                    </figcaption>
                </figure>
            ))

            }
        </React.Fragment>
    )
}

export default withStyles(styles)(DSGuideItem);