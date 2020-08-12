import React from 'react';
import { shallow } from 'enzyme';
import LoadingOverlay from '../../../Components/UI/LoadingOverlay';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<LoadingOverlay store={mockReduxStore({})}/>);
});