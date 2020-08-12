import React from 'react';
import { shallow } from 'enzyme';
import Catalog from '../../../Components/Catalog/Catalog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<Catalog store={mockReduxStore({})}/>);
});