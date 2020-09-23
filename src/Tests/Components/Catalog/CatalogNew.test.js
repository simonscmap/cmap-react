import React from 'react';
import { shallow } from 'enzyme';
import CatalogNew from '../../../Components/Catalog/CatalogNew';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<CatalogNew store={mockReduxStore({})}/>);
});