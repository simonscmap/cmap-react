import React from 'react';
import { shallow } from 'enzyme';
import DSCellEditorSelect from '../../../Components/DataSubmission/DSCellEditorSelect';
import mockReduxStore from '../../TestUtils/mockReduxStore'
import mockAGGridProps from '../../TestUtils/mockAGGridProps';

test('Renders without crashing', () => {
    const wrapper = shallow(<DSCellEditorSelect store={mockReduxStore({})} {...mockAGGridProps()}/>);
});