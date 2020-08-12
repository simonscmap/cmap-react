import React from 'react';
import { shallow } from 'enzyme';
import CruiseSelector from '../../../Components/Visualization/CruiseSelector';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CruiseSelector store={mockReduxStore({})}/>);
});