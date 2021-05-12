import React from 'react';
import { shallow } from 'enzyme';
import CartAddOrRemove from '../../../Components/Catalog/CartAddOrRemove';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CartAddOrRemove store={mockReduxStore({})}/>);
});