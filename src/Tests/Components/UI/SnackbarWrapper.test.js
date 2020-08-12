import React from 'react';
import { shallow } from 'enzyme';
import SnackbarWrapper from '../../../Components/UI/SnackbarWrapper';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SnackbarWrapper store={mockReduxStore({})}/>);
});