import React from 'react';
import { shallow } from 'enzyme';
import ValidationGrid from '../../../Components/DataSubmission/ValidationGrid';
import mockReduxStore from '../../TestUtils/mockReduxStore'
import mockAGGridProps from '../../TestUtils/mockAGGridProps';

test('Renders without crashing', () => {
    const wrapper = shallow(<ValidationGrid store={mockReduxStore({})} {...mockAGGridProps()}/>);
});