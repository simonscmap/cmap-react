import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { DateRange, Waves, CloudDownload } from '@material-ui/icons';

import colors from '../../Enums/colors';

import PaletteControls from './PaletteControls';
import ZValueControls from './ZValueControls';

const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white'
    },
    buttonBlock: {
        display:'block'
    },
    iconButtonWrapper: {
        display: 'inline-block'
    }
})

const ChartControlPanel = (props) => {

    const { 
        classes, 
        handlePaletteChoice, 
        onToggleSplitByDate, 
        onToggleSplitByDepth, 
        downloadCsv, 
        splitByDepth, 
        splitByDate,
        handleZValueConfirm,
        zValues,
        extent
    } = props;

    return (
        <div className={classes.buttonBlock}>

            <Tooltip title={splitByDate ? 'Merge Dates' : 'Split By Date'}>
                <div className={classes.iconButtonWrapper}>
                    <IconButton color='secondary' className={classes.iconButton} 
                        disabled={!Boolean(onToggleSplitByDate)} 
                        onClick={onToggleSplitByDate}
                    >
                        <DateRange/>
                    </IconButton>
                </div>
            </Tooltip>

            <Tooltip title={splitByDepth ? 'Merge Depths' : 'Split By Depth'}>
                <div className={classes.iconButtonWrapper}>
                    <IconButton color='secondary' className={classes.iconButton} 
                        disabled={!Boolean(onToggleSplitByDepth)} 
                        onClick={onToggleSplitByDepth}
                    >
                        <Waves/>
                    </IconButton>
                </div>
            </Tooltip>

            <Tooltip title='Download CSV'>
                <div className={classes.iconButtonWrapper}>
                    <IconButton color='secondary' onClick={downloadCsv} className={classes.iconButton} >
                        <CloudDownload/>
                    </IconButton>
                </div>
            </Tooltip>

            <ZValueControls
                disabled={!Boolean(handleZValueConfirm)}
                zValues={zValues}
                handleZValueConfirm={handleZValueConfirm}
                extent={extent}
            />
            
            <PaletteControls
                disabled={!Boolean(handlePaletteChoice)}
                handlePaletteChoice={handlePaletteChoice}
            />
        </div>
    )
}

export default withStyles(styles)(ChartControlPanel);