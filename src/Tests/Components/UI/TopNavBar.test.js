import React from 'react';
import { shallow } from 'enzyme';
import TopNavBar from '../../../Components/UI/TopNavBar';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<TopNavBar store={mockReduxStore({})}/>);
});