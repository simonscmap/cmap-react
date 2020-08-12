import React from 'react';
import { shallow } from 'enzyme';
import DepthProfileChart from '../../../Components/Visualization/DepthProfileChart';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DepthProfileChart store={mockReduxStore({})}/>);
});