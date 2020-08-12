import React from 'react';
import { shallow } from 'enzyme';
import DataSubmission from '../../../Components/DataSubmission/DataSubmission';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DataSubmission store={mockReduxStore({})}/>);
});