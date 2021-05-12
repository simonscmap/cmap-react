import React from 'react';
import { shallow } from 'enzyme';
import DatasetJSONLD from '../../../Components/Catalog/DatasetJSONLD';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DatasetJSONLD store={mockReduxStore({})}/>);
});