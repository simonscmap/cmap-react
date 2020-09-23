import React from 'react';
import { shallow } from 'enzyme';
import CatalogSearch from '../../../Components/Catalog/CatalogSearch';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CatalogSearch store={mockReduxStore({})}/>);
});