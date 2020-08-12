import React from 'react';
import { shallow } from 'enzyme';
import ApiKeyManagement from '../../../Components/User/ApiKeyManagement';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ApiKeyManagement store={mockReduxStore({})}/>);
});