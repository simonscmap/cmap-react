import React from 'react';
import { shallow } from 'enzyme';
import TimeSeriesChart from '../../../Components/Visualization/TimeSeriesChart';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<TimeSeriesChart store={mockReduxStore({})}/>);
});