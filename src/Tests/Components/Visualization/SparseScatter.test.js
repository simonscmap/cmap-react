import React from 'react';
import { shallow } from 'enzyme';
import SparseScatter from '../../../Components/Visualization/SparseScatter';
import mockReduxStore from '../../TestUtils/mockReduxStore'
import mockChartInfo from '../../TestUtils/mockChartInfo'

test('Renders without crashing', () => {
    const wrapper = shallow(<SparseScatter store={mockReduxStore({})} {...mockChartInfo()}/>);
});