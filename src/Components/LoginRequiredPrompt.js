import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';

import { showLoginDialog } from '../Redux/actions/ui';

const mapDispatchToProps = {
    showLoginDialog
}

const LoginRequiredPrompt = (props) => {

    useEffect(() => {
        props.showLoginDialog();
    })
    
    return (
        <p>This feature requires a user account. Please <Link component={RouterLink} to={{pathname: '/apikeymanagement'}} onClick={() => props.showLoginDialog()}> log in
            </Link> or <Link component={RouterLink} to={{pathname: '/register'}}> register
            </Link>.
        </p>
    )
}

export default connect(null, mapDispatchToProps)(LoginRequiredPrompt);

