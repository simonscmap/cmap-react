import React from 'react';
import { shallow } from 'enzyme';
import DataSubmissionNavbarDropdown from '../../../Components/DataSubmission/DataSubmissionNavbarDropdown';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DataSubmissionNavbarDropdown store={mockReduxStore({})}/>);
});