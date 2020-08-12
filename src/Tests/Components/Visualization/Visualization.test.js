import React from 'react';
import { shallow } from 'enzyme';
import Visualization from '../../../Components/Visualization/Visualization';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Visualization store={mockReduxStore({})}/>);
});