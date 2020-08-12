import React from 'react';
import { shallow } from 'enzyme';
import DSCellEditorTextArea from '../../../Components/DataSubmission/DSCellEditorTextArea';
import mockReduxStore from '../../TestUtils/mockReduxStore'
import mockAGGridProps from '../../TestUtils/mockAGGridProps';

test('Renders without crashing', () => {
    const wrapper = shallow(<DSCellEditorTextArea store={mockReduxStore({})} {...mockAGGridProps()}/>);
});