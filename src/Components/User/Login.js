import { useEffect } from 'react';
import { connect } from 'react-redux';

import { showLoginDialog } from '../../Redux/actions/ui';

const mapDispatchToProps = {
  showLoginDialog,
};

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
});

const Login = (props) => {
  useEffect(() => {
    if (!props.user) props.showLoginDialog();
    else window.location.href = '/catalog';
  });

  return '';
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
