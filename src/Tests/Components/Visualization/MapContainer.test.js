import React from 'react';
import { shallow } from 'enzyme';
import MapContainer from '../../../Components/Visualization/MapContainer';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<MapContainer store={mockReduxStore({})}/>);
});