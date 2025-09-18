import React from 'react';
import LoginForm from '../../../../Components/User/LoginForm';
import Spacer from '../../../../Components/Common/Spacer';
import Center from '../../../../Components/Common/Center';

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
};

export default EmbeddedLogin;
