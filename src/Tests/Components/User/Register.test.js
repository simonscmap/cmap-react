import React from 'react';
import { shallow } from 'enzyme';
import Register from '../../../Components/User/Register';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Register store={mockReduxStore({})}/>);
});