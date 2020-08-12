import React from 'react';
import { shallow } from 'enzyme';
import SectionMapChart from '../../../Components/Visualization/SectionMapChart';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SectionMapChart store={mockReduxStore({})}/>);
});