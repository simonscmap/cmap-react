import React from 'react';
import { shallow } from 'enzyme';
import Comment from '../../../Components/DataSubmission/Comment';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Comment store={mockReduxStore({})}/>);
});