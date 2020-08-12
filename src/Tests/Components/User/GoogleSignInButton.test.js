import React from 'react';
import { shallow } from 'enzyme';
import GoogleSignInButton from '../../../Components/User/GoogleSignInButton';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<GoogleSignInButton store={mockReduxStore({})}/>);
});