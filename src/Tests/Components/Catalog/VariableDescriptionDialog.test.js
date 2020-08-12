import React from 'react';
import { shallow } from 'enzyme';
import VariableDescriptionDialog from '../../../Components/Catalog/VariableDescriptionDialog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<VariableDescriptionDialog store={mockReduxStore({})}/>);
});