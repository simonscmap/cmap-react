import React from 'react';
import { shallow } from 'enzyme';
import Login from '../../../Components/User/Login';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Login store={mockReduxStore({})}/>);
});