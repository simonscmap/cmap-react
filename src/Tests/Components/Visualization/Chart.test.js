import React from 'react';
import { shallow } from 'enzyme';
import Charts from '../../../Components/Visualization/Charts';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Charts store={mockReduxStore({})}/>);
});