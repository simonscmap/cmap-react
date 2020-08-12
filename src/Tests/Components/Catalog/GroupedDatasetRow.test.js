import React from 'react';
import { shallow } from 'enzyme';
import GroupedDatasetRow from '../../../Components/Catalog/GroupedDatasetRow';

test('Renders without crashing', () => {
    const wrapper = shallow(<GroupedDatasetRow/>);
});