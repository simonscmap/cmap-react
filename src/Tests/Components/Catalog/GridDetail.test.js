import React from 'react';
import { shallow } from 'enzyme';
import GridDetails from '../../../Components/Catalog/GridDetail';

test('Renders without crashing', () => {
    const wrapper = shallow(<GridDetails/>);
});