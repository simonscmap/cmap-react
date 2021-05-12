import React from 'react';
import { shallow } from 'enzyme';
import DatasetPageAGGrid from '../../../Components/Catalog/DatasetPageAGGrid';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DatasetPageAGGrid store={mockReduxStore({})}/>);
});