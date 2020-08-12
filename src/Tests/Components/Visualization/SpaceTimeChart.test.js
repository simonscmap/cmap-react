import React from 'react';
import { shallow } from 'enzyme';
import SpaceTimeChart from '../../../Components/Visualization/SpaceTimeChart';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SpaceTimeChart store={mockReduxStore({})}/>);
});