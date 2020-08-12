import React from 'react';
import { shallow } from 'enzyme';
import MobileBlocker from '../../../Components/UI/MobileBlocker';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<MobileBlocker store={mockReduxStore({})}/>);
});