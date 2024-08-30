import React from 'react';
import LoginForm from '../../User/LoginForm';
import Spacer from '../../Common/Spacer';
import Center from '../../Common/Center';

const EmbeddedLogin = () => {
  return (
    <div>
      <Spacer>
        <Center>
          <LoginForm title="Please login to download data" />
        </Center>
      </Spacer>
    </div>
  );
}

export default EmbeddedLogin;
