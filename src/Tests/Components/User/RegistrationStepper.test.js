import React from 'react';
import { shallow } from 'enzyme';
import RegistrationStepper from '../../../Components/User/RegistrationStepper';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<RegistrationStepper store={mockReduxStore({})}/>);
});