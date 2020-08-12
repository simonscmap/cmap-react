import React from 'react';
import { shallow } from 'enzyme';
import SubmissionGuide from '../../../Components/DataSubmission/SubmissionGuide';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SubmissionGuide store={mockReduxStore({})}/>);
});