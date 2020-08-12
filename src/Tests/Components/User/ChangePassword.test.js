import React from 'react';
import { shallow } from 'enzyme';
import ChangePassword from '../../../Components/User/ChangePassword';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ChangePassword store={mockReduxStore({})}/>);
});