import React from 'react';
import { shallow } from 'enzyme';
import ConnectedTooltip from '../../../Components/UI/ConnectedTooltip';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<ConnectedTooltip store={mockReduxStore({})}/>);
});