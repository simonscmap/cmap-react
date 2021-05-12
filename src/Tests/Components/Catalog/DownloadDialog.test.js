import React from 'react';
import { shallow } from 'enzyme';
import DownloadDialog from '../../../Components/Catalog/DownloadDialog';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DownloadDialog store={mockReduxStore({})}/>);
});