import React from 'react';
import { shallow } from 'enzyme';
import ChangeEmail from '../../../Components/User/ChangeEmail';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ChangeEmail store={mockReduxStore({})}/>);
});