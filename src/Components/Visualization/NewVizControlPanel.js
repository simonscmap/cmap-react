import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { withStyles, Paper, ButtonGroup, Grid, IconButton, Icon, ListItem, MenuItem, Typography, Drawer, TextField, FormControl, InputLabel, Button, Tooltip, ClickAwayListener} from '@material-ui/core';
import { PlayArrow, ControlCamera , Settings, Fastfood, ShowChart, Search, Cached, LibraryBooks, ArrowRight, ChevronLeft, ChevronRight, InsertChartOutlined, Language, Delete, ShoppingCart, Info, DirectionsBoat } from '@material-ui/icons';

import { cruiseTrajectoryRequestSend, clearCharts, csvDownloadRequestSend, vizPageDataTargetSet } from '../../Redux/actions/visualization';
import { snackbarOpen } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';

import DataSearch from './DataSearch';


const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
    cruiseTrajectory: state.cruiseTrajectory,
    showHelp: state.showHelp,
    datasets: state.datasets,
    charts: state.charts,
    cart: state.cart,
    cruiseList: state.cruiseList,
    dataTarget: state.vizPageDataTarget
})

const mapDispatchToProps = {
    cruiseTrajectoryRequestSend,
    clearCharts,
    csvDownloadRequestSend,
    snackbarOpen,
    vizPageDataTargetSet
}

const drawerWidth = 300;

const styles = (theme) => ({
    drawerPaper: {
        width: drawerWidth,
        height: 'auto',
        // minHeight: 400,
        top: 'calc(50% - 270px)',
        borderRadius: '0 4px 4px 0',
        boxShadow: '2px 2px  2px 2px #242424',
        border: 'none',
        overflow: 'visible',
        backgroundColor: colors.backgroundGray
    },

    dataSearchMenuPaper: {
        position: 'fixed',
        // top: 'calc(50% - 270px)',
        top: 120,
        // left: drawerWidth + 10,
        left: 0,
        width: '100vw',
        height: 'auto',
        maxHeight: 'calc(100vh - 120px)',
        zIndex: 1500,
        backgroundColor: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(5px)',
    },

    openPanelChevron: {
        position: 'fixed',
        left: 5,
        top: 'calc(50% - 8px)',
        zIndex: 1100
      },
    
      closePanelChevron: {
        position: 'fixed',
        left: drawerWidth + 5,
        top: 'calc(50% - 8px)',
        zIndex: 1100
      },

    controlPanelItem: {
        textTransform: 'none',
        textAlign: 'left',
        fontSize: '17px',
        fontWeight: 200,
        color: colors.primary,
        justifyContent: 'flex-start'
    },

    controlPanelItemLabel: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-block'
    },

    controlPanelItemStartIcon: {
        display: 'inline-block'
    }
});

class NewVizControlPanel extends React.Component {

    state = {
        showControlPanel: true,
        dataSearchMenuOpen: false,
        relatedDataMenuOpen: false
    }

    handleSelectDataTarget = (target) => {
        this.setState({...this.state, dataSearchMenuOpen: false, relatedDataMenuOpen: false});
        this.props.vizPageDataTargetSet(target);
    }

    handleClickAway = () => {
        if(this.state.dataSearchMenuOpen){
            this.setState({...this.state, dataSearchMenuOpen: false});
        }
    }

    render = () => {
        const { 
            classes, 
            fields, 
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            selectedVizType,
            catalog,
            catalogRequestState,
            showCharts,
            handleShowGlobe,
            handleChange,
            handleLatLonChange,
            datasets,
            cruiseList,
            dataTarget
        } = this.props;

        const {
            showControlPanel,
            dataSearchMenuOpen
        } = this.state;

        const targetType = dataTarget && dataTarget.Name ? 'cruise' : 'dataset';

        return (
            <React.Fragment>
                { 
                    showControlPanel ? 
                    <IconButton 
                        className={classes.closePanelChevron} 
                        aria-label="toggle-panel" 
                        color="primary" 
                        onClick={() => this.setState({...this.state, showControlPanel: false})}>
                        <ChevronLeft />
                    </IconButton>
                    :

                    <IconButton 
                        className={classes.openPanelChevron} 
                        aria-label="toggle-panel" 
                        color="primary" 
                        onClick={() => this.setState({...this.state, showControlPanel: true})}>
                        <ChevronRight />
                    </IconButton>
                }

                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    // open={showControlPanel}
                    classes={{
                        paper: `${classes.drawerPaper}`,
                    }}
                    open={showControlPanel}
                    anchor="left"
                >
                    <Button
                        fullWidth={true}
                        // startIcon={<Search/>}
                        className={classes.controlPanelItem}
                        startIcon={dataTarget ?
                            <Tooltip title='Open Product Information Page' placement='top'>
                                <Info 
                                    style={{fontSize: '22px', margin: '0 0 -5px 4px'}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/catalog/${dataTarget.Name ? 'cruises' : 'datasets'}/${dataTarget.Name ? dataTarget.Name : dataTarget.Short_Name}`, '_blank');
                                    }}
                                />
                            </Tooltip>  : 
                            <Search style={{fontSize: '22px', margin: '0 0 -6px 4px'}}/>
                        }
                        onClick={() => this.setState({...this.state, dataSearchMenuOpen: true})}
                        classes={{
                            label: classes.controlPanelItemLabel,
                            startIcon: classes.controlPanelItemStartIcon
                        }}
                    >
                        { dataTarget ? (dataTarget.Name || dataTarget.Long_Name) : 'Select a Variable'}
                    </Button>

                    {
                        dataTarget ?
                            <Button
                                fullWidth={true}
                                className={classes.controlPanelItem}
                                startIcon={<ControlCamera style={{fontSize: '22px', marginLeft: '5px'}}/>}
                            >
                                Find Related Data
                            </Button>  

                            :

                            ''
                    }

                    {
                        dataTarget && dataTarget.Name ?
                        
                        <>                                                                   
                            <Button
                                fullWidth={true}
                                className={classes.controlPanelItem}
                                
                            >
                                Show Data on Globe
                            </Button>
                        </> : ''
                    }

                    {
                        dataTarget && dataTarget.Product_Type === 'Dataset' ?
                        <>
                            <Button
                                fullWidth={true}
                                className={classes.controlPanelItem}                                
                            >
                                Create Plot
                            </Button>
                        </>
                        : ''
                    }
                </Drawer>
                
                <ClickAwayListener 
                    onClickAway={this.handleClickAway}
                    mouseEvent='onMouseDown'
                >
                    <Paper className={classes.dataSearchMenuPaper} style={dataSearchMenuOpen ? {} : {display: 'none'}}>
                        <DataSearch
                            handleSelectDataTarget={this.handleSelectDataTarget}
                        />
                    </Paper>
                </ClickAwayListener>
            </React.Fragment>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewVizControlPanel));