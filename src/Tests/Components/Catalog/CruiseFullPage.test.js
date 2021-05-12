import React from 'react';
import { shallow } from 'enzyme';
import CruiseFullPage from '../../../Components/Catalog/CruiseFullPage';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CruiseFullPage store={mockReduxStore({})}/>);
});