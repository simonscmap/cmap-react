import React from 'react';
import { shallow } from 'enzyme';
import SearchResults from '../../../Components/Catalog/SearchResults';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<SearchResults store={mockReduxStore({})}/>);
});