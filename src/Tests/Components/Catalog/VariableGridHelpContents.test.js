import React from 'react';
import { shallow } from 'enzyme';
import VariableGridHelpContents from '../../../Components/Catalog/VariableGridHelpContents';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<VariableGridHelpContents store={mockReduxStore({})}/>);
});