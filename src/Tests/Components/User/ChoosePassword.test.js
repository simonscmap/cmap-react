import React from 'react';
import { shallow } from 'enzyme';
import ChoosePassword from '../../../Components/User/ChoosePassword';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ChoosePassword store={mockReduxStore({})}/>);
});