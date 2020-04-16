import React from 'react';
import { connect } from 'react-redux';

import { Tooltip } from '@material-ui/core';

import { copyTextToClipboard } from '../../Redux/actions/ui';

const mapDispatchToProps = {
    copyTextToClipboard
}

// Wraps a tooltip and span with click event handler for copying to clipboard
const CopyableText = (props) => {
    const { copyTextToClipboard, tooltipPlacement, text, innerSpanProps, hideTooltip } = props;

    const handleCopyText = (event) => {
        copyTextToClipboard(event.target.innerText);
    }

    if(hideTooltip){
        return (
            <span 
                style={{cursor: 'copy'}} 
                onClick={handleCopyText} 
                {...innerSpanProps}
            >
                {text}
            </span>
        )
    }

    return (
        <Tooltip placement={tooltipPlacement || 'top'} title='Click to Copy'>
            <span 
                style={{cursor: 'copy'}} 
                onClick={handleCopyText} 
                {...innerSpanProps}
            >
                {text}
            </span>
        </Tooltip>
    )
}

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(CopyableText);