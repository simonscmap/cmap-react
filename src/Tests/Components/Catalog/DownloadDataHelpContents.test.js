import React from 'react';
import { shallow } from 'enzyme';
import DownloadDataHelpContents from '../../../Components/Catalog/DownloadDataHelpContents';
import mockReduxStore from '../../TestUtils/mockReduxStore'

test('Renders without crashing', () => {
    const wrapper = shallow(<DownloadDataHelpContents store={mockReduxStore({})}/>);
});