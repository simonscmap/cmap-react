import React from 'react';
import { shallow } from 'enzyme';
import SearchResult from '../../../Components/Catalog/SearchResult';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SearchResult store={mockReduxStore({})}/>);
});