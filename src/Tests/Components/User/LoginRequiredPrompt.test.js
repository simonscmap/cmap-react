import React from 'react';
import { shallow } from 'enzyme';
import LoginRequiredPrompt from '../../../Components/User/LoginRequiredPrompt';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<LoginRequiredPrompt store={mockReduxStore({})}/>);
});