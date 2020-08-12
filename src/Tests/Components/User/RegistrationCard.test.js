import React from 'react';
import { shallow } from 'enzyme';
import RegistrationCard from '../../../Components/User/RegistrationCard';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<RegistrationCard store={mockReduxStore({})}/>);
});