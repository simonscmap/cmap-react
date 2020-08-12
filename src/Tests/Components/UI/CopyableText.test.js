import React from 'react';
import { shallow } from 'enzyme';
import CopyableText from '../../../Components/UI/CopyableText';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CopyableText store={mockReduxStore({})}/>);
});