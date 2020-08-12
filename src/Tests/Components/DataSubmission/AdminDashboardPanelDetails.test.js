import React from 'react';
import { shallow } from 'enzyme';
import AdminDashboardPanelDetails from '../../../Components/DataSubmission/AdminDashboardPanelDetails';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<AdminDashboardPanelDetails store={mockReduxStore({})}/>);
});