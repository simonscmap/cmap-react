import React from 'react';
import { shallow } from 'enzyme';
import DatasetDescriptionDialog from '../../../Components/Catalog/DatasetDescriptionDialog';

test('Renders without crashing', () => {
    const wrapper = shallow(<DatasetDescriptionDialog/>);
});