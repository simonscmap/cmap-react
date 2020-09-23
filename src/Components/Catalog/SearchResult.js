import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Typography, Paper, Tooltip, Link, Button } from '@material-ui/core';
import { Info } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const mapStateToProps = (state, ownProps) => ({

})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    resultWrapper: {
        padding: '4px 12px',
        height: '200px'
    },

    image: {
        maxWidth: '15vw',
        height: '170px',
        marginTop: '12px',
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        },
    },

    gridRow: {
        marginBottom: '8px',
        textAlign: 'left'
    },

    longName: {
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '1.15rem',
        display: 'block',
        margin: '6px 0'
    },

    resultPaper: {
        marginTop: '22px'
    },

    denseText: {
        fontSize: '.9rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    moreInfoButton: {
        textTransform: 'none',
        color: theme.palette.primary.main,
        paddingLeft: '4px'
    }

});

const SearchResult = (props) => {
    const { classes } = props;
    const {
        Spatial_Resolution,
        Temporal_Resolution,
        Short_Name, 
        Long_Name, 
        Icon_URL, 
        Process_Level, 
        Data_Source, 
        Depth_Max, 
        Time_Min, 
        Time_Max, 
        Dataset_ID,
        Sensors
    } = props.dataset;
    
    return (
        <Paper className={classes.resultPaper} elevation={4}>
            <Grid container className={classes.resultWrapper}>
                <Grid item xs={12} md={8} className={classes.gridRow}>

                    <Tooltip title={Long_Name} enterDelay={400} placement='top'>
                        <Link 
                            component={RouterLink} 
                            to={`/catalog/datasets/${Short_Name}`}
                            className={classes.longName}
                        >
                            {Long_Name}
                        </Link>
                    </Tooltip>

                    <Typography className={classes.denseText}>
                        {Process_Level} Data from {Data_Source}
                    </Typography>

                    <Typography className={classes.denseText}>
                        Sensor{Sensors.length > 1 ? 's' : ''}: {Sensors.join(', ')}
                    </Typography>
                    
                    <Typography className={classes.denseText}>
                        Temporal Resolution: {Temporal_Resolution} 
                    </Typography>

                    <Typography className={classes.denseText}>
                        Temporal Coverage: {
                            Time_Min && Time_Max ?
                            ` ${Time_Min.slice(0,10)} to ${Time_Max.slice(0,10)}`
                            :'NA'
                        }
                    </Typography>

                    <Typography className={classes.denseText}>
                        Spatial Resolution: {Spatial_Resolution}
                    </Typography>

                    <Typography className={classes.denseText}>
                        {Depth_Max ?
                            'Multiple Depth Levels' :
                            'Surface Level Data'
                        }
                    </Typography>

                    <Button
                        variant="text"
                        color="primary"
                        className={classes.moreInfoButton}
                        startIcon={<Info/>}
                        component={RouterLink} 
                        to={`/catalog/datasets/${Short_Name}`}
                    >
                        More Info
                    </Button>

                </Grid>

                <Grid item xs={12} md={4}>
                    <img src={Icon_URL} alt={Short_Name} className={classes.image}/>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SearchResult));