import React from 'react';
import { shallow } from 'enzyme';
import UserNavbarDropdown from '../../../Components/User/UserNavbarDropdown';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<UserNavbarDropdown store={mockReduxStore({})}/>);
});