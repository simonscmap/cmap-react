import React from 'react';
import { shallow } from 'enzyme';
import GlobalUIComponentWrapper from '../../../Components/UI/GlobalUIComponentWrapper';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<GlobalUIComponentWrapper store={mockReduxStore({})}/>);
});