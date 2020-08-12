import React from 'react';
import { shallow } from 'enzyme';
import UserDashboardPanelDetails from '../../../Components/DataSubmission/UserDashboardPanelDetails';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<UserDashboardPanelDetails store={mockReduxStore({})}/>);
});