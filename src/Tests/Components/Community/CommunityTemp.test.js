import React from 'react';
import { shallow } from 'enzyme';
import CommunityTemp from '../../../Components/Community/CommunityTemp';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CommunityTemp/>);
});