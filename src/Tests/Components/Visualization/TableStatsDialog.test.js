import React from 'react';
import { shallow } from 'enzyme';
import TableStatsDialog from '../../../Components/Visualization/VariableDetailsDialog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<TableStatsDialog store={mockReduxStore({})}/>);
});