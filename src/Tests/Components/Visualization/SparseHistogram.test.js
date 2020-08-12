import React from 'react';
import { shallow } from 'enzyme';
import SparseHistogram from '../../../Components/Visualization/SparseHistogram';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SparseHistogram store={mockReduxStore({})}/>);
});