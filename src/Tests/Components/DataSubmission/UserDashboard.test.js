import React from 'react';
import { shallow } from 'enzyme';
import UserDashboard from '../../../Components/DataSubmission/UserDashboardPanelDetails';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<UserDashboard store={mockReduxStore({})}/>);
});