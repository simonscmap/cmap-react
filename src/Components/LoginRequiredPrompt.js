import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { showLoginDialog } from '../Redux/actions/ui';

const mapDispatchToProps = {
    showLoginDialog
}

const LoginRequiredPrompt = (props) => {

    useEffect(() => {
        props.showLoginDialog();
    })
    
    return (
        <p>This feature requires login. Please log in.</p>
    )
}

export default connect(null, mapDispatchToProps)(LoginRequiredPrompt);

