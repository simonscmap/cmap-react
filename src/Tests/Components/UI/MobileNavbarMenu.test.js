import React from 'react';
import { shallow } from 'enzyme';
import MobileNavbarMenu from '../../../Components/UI/MobileNavbarMenu';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<MobileNavbarMenu store={mockReduxStore({})}/>);
});