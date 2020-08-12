import React from 'react';
import { shallow } from 'enzyme';
import VizControlPanel from '../../../Components/Visualization/VizControlPanel';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<VizControlPanel store={mockReduxStore({})}/>);
});