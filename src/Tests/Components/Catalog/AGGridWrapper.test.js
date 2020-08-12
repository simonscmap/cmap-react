import React from 'react';
import { shallow } from 'enzyme';
import AGGridWrapper from '../../../Components/Catalog/AGGridWrapper';

test('Renders without crashing', () => {
    const wrapper = shallow(<AGGridWrapper/>);
});