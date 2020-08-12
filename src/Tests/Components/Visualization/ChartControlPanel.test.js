import React from 'react';
import { shallow } from 'enzyme';
import ChartControlPanel from '../../../Components/Visualization/ChartControlPanel';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ChartControlPanel store={mockReduxStore({})}/>);
});