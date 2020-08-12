import React from 'react';
import { shallow } from 'enzyme';
import ForgotPass from '../../../Components/User/ForgotPass';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ForgotPass store={mockReduxStore({})}/>);
});