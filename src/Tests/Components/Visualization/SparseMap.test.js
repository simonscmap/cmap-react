import React from 'react';
import { shallow } from 'enzyme';
import SparseMap from '../../../Components/Visualization/SparseMap';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SparseMap store={mockReduxStore({})}/>);
});