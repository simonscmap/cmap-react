import React from 'react';
import { shallow } from 'enzyme';
import AdminDashboard from '../../../Components/DataSubmission/AdminDashboard';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<AdminDashboard store={mockReduxStore({})}/>);
});