import React from 'react';
import { shallow } from 'enzyme';
import Histogram from '../../../Components/Visualization/Histogram';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Histogram store={mockReduxStore({})}/>);
});