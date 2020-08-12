import React from 'react';
import { shallow } from 'enzyme';
import DSCellEditor from '../../../Components/DataSubmission/DSCellEditor';
import mockReduxStore from '../../TestUtils/mockReduxStore'
import mockAGGridProps from '../../TestUtils/mockAGGridProps';

test('Renders without crashing', () => {
    const wrapper = shallow(<DSCellEditor store={mockReduxStore({})} {...mockAGGridProps()}/>);
});