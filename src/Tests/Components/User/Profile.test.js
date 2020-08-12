import React from 'react';
import { shallow } from 'enzyme';
import Profile from '../../../Components/User/Profile';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Profile store={mockReduxStore({})}/>);
});