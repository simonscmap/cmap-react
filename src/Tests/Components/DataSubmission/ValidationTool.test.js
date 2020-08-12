import React from 'react';
import { shallow } from 'enzyme';
import ValidationTool from '../../../Components/DataSubmission/ValidationTool';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ValidationTool store={mockReduxStore({})}/>);
});