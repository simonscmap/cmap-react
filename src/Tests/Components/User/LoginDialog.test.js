import React from 'react';
import { shallow } from 'enzyme';
import LoginDialog from '../../../Components/User/LoginDialog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<LoginDialog store={mockReduxStore({})}/>);
});